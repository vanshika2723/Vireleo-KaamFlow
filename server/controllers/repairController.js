
const mongoose = require("mongoose");
const RepairLog = require("../models/RepairLog");
const ServiceRequest = require("../models/ServiceRequest");

// WORKSPACE HELPER
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// CREATE REPAIR LOG
const createRepairLog = async (req, res) => {
  try {
    const {
      workPerformed,
      partsUsed,
      timeSpent,
      technicianNotes
    } = req.body;

    if (req.user.role !== "Technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can create repair logs"
      });
    }

    if (!mongoose.isValidObjectId(req.params.requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    if (!workPerformed || !workPerformed.trim()) {
      return res.status(400).json({
        success: false,
        message: "Work performed is required"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: req.params.requestId,
      assignedTechnician: req.user._id,
      businessId: req.user.businessId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assigned service request not found"
      });
    }

    if (!["Repair In Progress", "QC Failed"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Repair log can only be created during active repair or rework"
      });
    }

    const validParts = Array.isArray(partsUsed) ? partsUsed : [];

    for (const part of validParts) {
      if (
        !part.name ||
        !Number.isInteger(Number(part.quantity)) ||
        Number(part.quantity) < 1 ||
        !Number.isFinite(Number(part.unitCost ?? 0)) ||
        Number(part.unitCost ?? 0) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid parts information"
        });
      }
    }

    if (
      timeSpent !== undefined &&
      (!Number.isFinite(Number(timeSpent)) || Number(timeSpent) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Time spent must be a non-negative number"
      });
    }

    const repairLog = await RepairLog.create({
      serviceRequest: request._id,
      technician: req.user._id,
      workPerformed: workPerformed.trim(),
      partsUsed: validParts,
      timeSpent: timeSpent ?? 0,
      technicianNotes: technicianNotes || ""
    });

    res.status(201).json({
      success: true,
      message: "Repair log created successfully",
      repairLog
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET REPAIR LOGS
const getRepairLogs = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID"
      });
    }

    const user = req.user;
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
        message: "You are not allowed to view these repair logs"
      });
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const repairLogs = await RepairLog.find({
      serviceRequest: request._id
    })
      .populate("technician", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: repairLogs.length,
      repairLogs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRepairLog,
  getRepairLogs
};
