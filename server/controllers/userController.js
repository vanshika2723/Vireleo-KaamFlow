
const User = require("../models/User");

// GET ACTIVE TECHNICIANS OF SAME WORKSPACE
const getTechnicians = async (req, res) => {
  try {
    const businessId =
      req.user.businessId ||
      (req.user.role === "Admin" ? req.user._id : null);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a workspace"
      });
    }

    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view technicians"
      });
    }

    const technicians = await User.find({
      role: "Technician",
      businessId,
      isActive: true
    })
      .select("name email phone role isActive")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: technicians.length,
      technicians
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET LOGGED-IN USER PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phone role businessName businessAddress notificationPreferences"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE LOGGED-IN USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      businessName,
      businessAddress,
      notificationPreferences
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty"
        });
      }

      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (businessName !== undefined) {
      user.businessName = String(businessName).trim();
    }

    if (businessAddress !== undefined) {
      user.businessAddress = String(businessAddress).trim();
    }

    if (notificationPreferences !== undefined) {
      const allowedKeys = [
        "newRequest",
        "repairUpdates",
        "paymentUpdates",
        "customerFeedback"
      ];

      for (const key of allowedKeys) {
        if (
          typeof notificationPreferences[key] === "boolean"
        ) {
          user.notificationPreferences[key] =
            notificationPreferences[key];
        }
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "name email phone role businessName businessAddress notificationPreferences"
    );

    res.status(200).json({
      success: true,
      message: "Profile settings updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getTechnicians,
  getProfile,
  updateProfile
};
