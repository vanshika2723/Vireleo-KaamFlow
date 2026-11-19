
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Customer = require("../models/Customer");
const Asset = require("../models/Asset");
const ServiceRequest = require("../models/ServiceRequest");

const migrateWorkspace = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Find the existing Admin account
    const admin = await User.findOne({
      email: "admin@kaamflow.com",
      role: "Admin"
    });

    if (!admin) {
      throw new Error("Admin account not found");
    }

    const businessId = admin._id;

    // Connect Admin to their own workspace
    admin.businessId = businessId;
    await admin.save();

    // Connect existing Service Desk and Technicians
    await User.updateMany(
      {
        role: { $in: ["Service Desk", "Technician"] },
        businessId: null
      },
      {
        $set: { businessId }
      }
    );

    // Migrate Customers
    const customers = await Customer.find({
      $or: [
        { businessId: null },
        { businessId: { $exists: false } }
      ]
    });

    for (const customer of customers) {
      const creator = await User.findById(customer.createdBy);

      if (creator) {
        customer.businessId =
          creator.businessId ||
          (creator.role === "Admin" ? creator._id : businessId);

        await customer.save();
      }
    }

    // Migrate Assets
    const assets = await Asset.find({
      $or: [
        { businessId: null },
        { businessId: { $exists: false } }
      ]
    });

    for (const asset of assets) {
      const customer = await Customer.findById(asset.customer);

      if (customer?.businessId) {
        asset.businessId = customer.businessId;
        await asset.save();
      }
    }

    // Migrate Service Requests
    const requests = await ServiceRequest.find({
      $or: [
        { businessId: null },
        { businessId: { $exists: false } }
      ]
    });

    for (const request of requests) {
      const customer = await Customer.findById(request.customer);
      const creator = await User.findById(request.createdBy);

      request.businessId =
        customer?.businessId ||
        creator?.businessId ||
        (creator?.role === "Admin" ? creator._id : businessId);

      await request.save();
    }

    console.log("Workspace migration completed successfully");

    console.log({
      customersMigrated: customers.length,
      assetsMigrated: assets.length,
      requestsMigrated: requests.length
    });

  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

migrateWorkspace();
