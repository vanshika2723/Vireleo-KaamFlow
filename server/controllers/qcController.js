
const QC = require("../models/QC");
const RepairLog = require("../models/RepairLog");
const ServiceRequest = require("../models/ServiceRequest");

const createQC = async (req, res) => {
  try {
    const { checks, overallNotes } = req.body;
    const { requestId } = req.params;

    if (!["QC Reviewer", "Admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only QC reviewers or Admin can perform quality checks"
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
        typeof check.passed !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "Each check must have an item and pass/fail result"
        });
      }
    }

    const request = await ServiceRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const repairLog = await RepairLog.findOne({
      serviceRequest: requestId
    }).sort({ createdAt: -1 });

    if (!repairLog) {
      return res.status(400).json({
        success: false,
        message: "Repair log is required before QC"
      });
    }

    const existingQC = await QC.findOne({
      serviceRequest: requestId
    });

    if (existingQC) {
      return res.status(400).json({
        success: false,
        message: "QC has already been submitted for this request"
      });
    }

    const allPassed = checks.every(
      (check) => check.passed === true
    );

    const qc = await QC.create({
      serviceRequest: requestId,
      repairLog: repairLog._id,
      reviewer: req.user._id,
      checks,
      result: allPassed ? "Passed" : "Failed",
      overallNotes: overallNotes || "",
      reviewedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Quality check completed successfully",
      qc
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getQCByRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(
      req.params.requestId
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const qc = await QC.findOne({
      serviceRequest: request._id
    })
      .populate("reviewer", "name email")
      .populate("repairLog");

    if (!qc) {
      return res.status(404).json({
        success: false,
        message: "QC record not found"
      });
    }

    res.status(200).json({
      success: true,
      qc
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createQC,
  getQCByRequest
};
