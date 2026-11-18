
const RepairLog = require("../models/RepairLog");
const ServiceRequest = require("../models/ServiceRequest");

const createRepairLog = async (req, res) => {
  try {
    const {
      workPerformed,
      partsUsed,
      timeSpent,
      technicianNotes
    } = req.body;

    if (!workPerformed || !workPerformed.trim()) {
      return res.status(400).json({
        success: false,
        message: "Work performed is required"
      });
    }

    if (req.user.role !== "Technician") {
      return res.status(403).json({
        success: false,
        message: "Only technicians can create repair logs"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: req.params.requestId,
      assignedTechnician: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Assigned service request not found"
      });
    }

    if (!request.assignedTechnician) {
      return res.status(400).json({
        success: false,
        message: "Assign a technician before starting repair"
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

const getRepairLogs = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const isAssignedTechnician =
      request.assignedTechnician?.toString() === req.user._id.toString();

    const isStaff = [
      "Admin",
      "Service Desk",
      "QC Reviewer"
    ].includes(req.user.role);

    if (!isAssignedTechnician && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these repair logs"
      });
    }

    const repairLogs = await RepairLog.find({
      serviceRequest: request._id
    }).populate("technician", "name email");

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
