
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");

dotenv.config();

const createUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const users = [
      {
        name: "KAAMFLOW Admin",
        email: "admin@kaamflow.com",
        password: "Admin@123",
        role: "Admin"
      },
      {
        name: "KAAMFLOW Technician",
        email: "technician@kaamflow.com",
        password: "Tech@123",
        role: "Technician"
      },
      {
        name: "KAAMFLOW Service Desk",
        email: "servicedesk@kaamflow.com",
        password: "Desk@123",
        role: "Service Desk"
      }
    ];

    const savedUsers = {};

    // Create or update accounts
    for (const userData of users) {
      let user = await User.findOne({
        email: userData.email
      });

      if (user) {
        user.name = userData.name;
        user.password = userData.password;
        user.role = userData.role;
        user.isActive = true;

        await user.save();

        console.log(`${userData.role} account updated`);
      } else {
        user = await User.create(userData);
        console.log(`${userData.role} account created`);
      }

      savedUsers[userData.role] = user;
    }

    // Admin is the workspace owner
    const admin = savedUsers["Admin"];

    admin.businessId = admin._id;

    await admin.save();

    // Connect Service Desk and Technician to Admin workspace
    const teamRoles = ["Service Desk", "Technician"];

    for (const role of teamRoles) {
      const member = savedUsers[role];

      member.businessId = admin._id;

      await member.save();

      console.log(`${role} connected to Admin workspace`);
    }

    console.log("\nWorkspace setup completed!");
    console.log("Workspace ID:", admin._id.toString());

  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected");
  }
};

createUsers();
