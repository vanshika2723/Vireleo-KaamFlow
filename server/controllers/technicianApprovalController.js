
const TechnicianApplication = require("../models/TechnicianApplication");
const User = require("../models/User");
const crypto = require("crypto");
// GET ALL TECHNICIAN APPLICATIONS
const getTechnicianApplications = async (req, res) => {
  try {
    const applications = await TechnicianApplication.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Get Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch technician applications."
    });
  }
};

// APPROVE TECHNICIAN APPLICATION

// APPROVE TECHNICIAN APPLICATION
const approveTechnicianApplication = async (req, res) => {
  try {
    const application = await TechnicianApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    if (application.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This application has already been reviewed."
      });
    }

    const existingUser = await User.findOne({
      email: application.email
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user account with this email already exists."
      });
    }

    // Generate a secure activation token
    const activationToken = crypto.randomBytes(32).toString("hex");

    const activationTokenHash = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    // Temporary password until technician sets their own password
    const temporaryPassword = crypto.randomBytes(32).toString("hex");

    const technician = await User.create({
      name: application.name,
      email: application.email,
      phone: application.phone,
      password: temporaryPassword,
      role: "Technician",
      businessId: req.user.businessId || req.user._id,
      isActive: true
    });

    // Save activation details
    application.status = "Approved";
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.adminNotes = "Application approved by Admin.";
    application.activationTokenHash = activationTokenHash;
    application.activationTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    application.activationCompletedAt = null;

    await application.save();

    const clientUrl = (
      process.env.CLIENT_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const activationLink =
      `${clientUrl}/technician-activate?token=${activationToken}`;

    return res.status(200).json({
      success: true,
      message: "Technician application approved and account created.",
      technician: {
        id: technician._id,
        name: technician.name,
        email: technician.email
      },
      activationLink
    });

  } catch (error) {
    console.error("Approve Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve application."
    });
  }
};

// ACTIVATE TECHNICIAN ACCOUNT
const activateTechnicianAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Activation token and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const application = await TechnicianApplication.findOne({
      activationTokenHash: tokenHash
    }).select("+activationTokenHash");

    if (!application || application.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid activation link."
      });
    }

    if (application.activationCompletedAt) {
      return res.status(400).json({
        success: false,
        message: "This account has already been activated."
      });
    }

    if (
      !application.activationTokenExpiry ||
      application.activationTokenExpiry < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Activation link has expired. Contact Admin."
      });
    }

    const technician = await User.findOne({
      email: application.email
    });

    if (!technician || technician.role !== "Technician") {
      return res.status(404).json({
        success: false,
        message: "Technician account not found."
      });
    }

    technician.password = password;
    await technician.save();

    application.activationCompletedAt = new Date();
    application.activationTokenHash = null;
    application.activationTokenExpiry = null;

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Account activated successfully. You can now log in."
    });

  } catch (error) {
    console.error("Technician Activation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to activate technician account."
    });
  }
};


// REJECT TECHNICIAN APPLICATION
const rejectTechnicianApplication = async (req, res) => {
  try {
    const application = await TechnicianApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    if (application.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "This application has already been reviewed."
      });
    }

    application.status = "Rejected";
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    application.adminNotes =
      req.body.adminNotes || "Application rejected by Admin.";

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Technician application rejected."
    });

  } catch (error) {
    console.error("Reject Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject application."
    });
  }
};

module.exports = {
  getTechnicianApplications,
  approveTechnicianApplication,
  rejectTechnicianApplication,
  activateTechnicianAccount
};