
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
      }
    ];

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
        await User.create(userData);
        console.log(`${userData.role} account created`);
      }
    }

  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected");
  }
};

createUsers();
