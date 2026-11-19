
const mongoose = require("mongoose");
const QC = require("../models/QC");
const RepairLog = require("../models/RepairLog");
const ServiceRequest = require("../models/ServiceRequest");

// WORKSPACE HELPER
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// CREATE QUALITY CHECK
const createQC = async (req, res) => {
  try {
    const { checks, overallNotes } = req.body;
    const { requestId } = req.params;

    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can perform quality checks currently"
      });
    }

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    if (!Array.isArray(checks) || checks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one QC check is required"
      });
    }

    for (const check of checks) {
      if (
        !check.item ||
        typeof check.item !== "string" ||
        typeof check.passed !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Each check must contain an item and a valid passed value"
        });
      }
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "Admin is not connected to a workspace"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      businessId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    if (request.status !== "Repair Completed") {
      return res.status(400).json({
        success: false,
        message: "QC can only be performed after repair is completed"
      });
    }

    const repairLog = await RepairLog.findOne({
      serviceRequest: request._id
    }).sort({ createdAt: -1 });

    if (!repairLog) {
      return res.status(400).json({
        success: false,
        message: "No repair log found for this request"
      });
    }

    const existingQC = await QC.findOne({
      serviceRequest: request._id,
      repairLog: repairLog._id
    });

    if (existingQC) {
      return res.status(400).json({
        success: false,
        message: "QC has already been performed for this repair log"
      });
    }

    const allPassed = checks.every(
      (check) => check.passed === true
    );

    const qc = await QC.create({
      serviceRequest: request._id,
      repairLog: repairLog._id,
      reviewer: req.user._id,
      checks,
      result: allPassed ? "Passed" : "Failed",
      overallNotes: overallNotes || "",
      reviewedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Quality check ${allPassed ? "passed" : "failed"} successfully`,
      qc
    });

  } catch (error) {
    console.error("Create QC Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quality check",
      error: error.message
    });
  }
};

// GET QC RECORD BY SERVICE REQUEST
const getQCByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = req.user;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    let request = null;

    if (["Admin", "Service Desk"].includes(user.role)) {
      const businessId = getWorkspaceId(user);

      if (!businessId) {
        return res.status(403).json({
          success: false,
          message: "User is not connected to a workspace"
        });
      }

      request = await ServiceRequest.findOne({
        _id: requestId,
        businessId
      });

    } else if (user.role === "Technician") {
      request = await ServiceRequest.findOne({
        _id: requestId,
        assignedTechnician: user._id,
        businessId: user.businessId
      });

    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view QC records"
      });
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const qc = await QC.findOne({
      serviceRequest: request._id
    })
      .sort({ createdAt: -1 })
      .populate("reviewer", "name email")
      .populate("repairLog");

    if (!qc) {
      return res.status(404).json({
        success: false,
        message: "No QC record found for this request"
      });
    }

    return res.status(200).json({
      success: true,
      qc
    });

  } catch (error) {
    console.error("Get QC Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch QC record",
      error: error.message
    });
  }
};

module.exports = {
  createQC,
  getQCByRequest
};
