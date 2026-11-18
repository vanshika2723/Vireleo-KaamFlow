
const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const Asset = require("../models/Asset");
const Diagnosis = require("../models/Diagnosis");
const RepairLog = require("../models/RepairLog");
const QC = require("../models/QC");
const User = require("../models/User");
const Quote = require("../models/Quote");

// CREATE SERVICE REQUEST
const createRequest = async (req, res) => {
  try {
    const {
      customer,
      asset,
      reportedSymptom,
      priority,
      preferredDate,
      serviceAddress
    } = req.body;

    if (!customer || !asset || !reportedSymptom) {
      return res.status(400).json({
        success: false,
        message: "Customer, asset and reported symptom are required"
      });
    }

    const customerExists = await Customer.findOne({
      _id: customer,
      createdBy: req.user._id,
      isActive: true
    });

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    const assetExists = await Asset.findOne({
      _id: asset,
      customer,
      createdBy: req.user._id
    });

    if (!assetExists) {
      return res.status(404).json({
        success: false,
        message: "Asset not found for this customer"
      });
    }

    const requestId = `KF-${Date.now()}`;

    const serviceRequest = await ServiceRequest.create({
      requestId,
      customer,
      asset,
      reportedSymptom,
      priority: priority || "Normal",
      preferredDate: preferredDate || null,
      serviceAddress,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Service request created successfully",
      serviceRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL REQUESTS
const getRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      createdBy: req.user._id
    })
      .populate("customer", "name email phone")
      .populate("asset", "category brand model serialNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE REQUEST
const getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    })
      .populate("customer", "name email phone address")
      .populate("asset", "category brand model serialNumber condition");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE REQUEST STATUS
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const transitions = {
      "Needs Review": [
        "Accepted",
        "Needs More Information",
        "Out of Coverage",
        "Declined"
      ],
      "Accepted": ["Open"],
      "Open": ["In Diagnosis"],
      "In Diagnosis": ["Diagnosis Completed"],
      "Diagnosis Completed": ["Repair In Progress"],
      "Repair In Progress": ["Repair Completed"],
      "Repair Completed": ["QC Passed", "QC Failed"],
      "QC Failed": ["Repair In Progress"],
      "QC Passed": ["Ready for Handover"],
      "Ready for Handover": ["Completed"]
    };

    const allowedNextStatuses = transitions[request.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${request.status} to ${status}`
      });
    }

    if (status === "Diagnosis Completed") {
      const diagnosis = await Diagnosis.findOne({
        serviceRequest: request._id
      });

      if (!diagnosis) {
        return res.status(400).json({
          success: false,
          message: "Save diagnosis before completing it"
        });
      }
    }

    if (status === "Repair Completed") {
      const repairLog = await RepairLog.findOne({
        serviceRequest: request._id
      });

      if (!repairLog) {
        return res.status(400).json({
          success: false,
          message: "Repair log must be created before completing repair"
        });
      }
    }

    if (status === "QC Passed" || status === "QC Failed") {
      const qcRecord = await QC.findOne({
        serviceRequest: request._id
      });

      if (!qcRecord) {
        return res.status(400).json({
          success: false,
          message: "QC inspection must be completed first"
        });
      }

      const expectedResult = status.replace("QC ", "");

      if (qcRecord.result !== expectedResult) {
        return res.status(400).json({
          success: false,
          message: "QC result does not match requested status"
        });
      }
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ASSIGN TECHNICIAN
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to assign technicians"
      });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const technician = await User.findOne({
      _id: technicianId,
      role: "Technician",
      isActive: true
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Active technician not found"
      });
    }

    const approvedQuote = await Quote.findOne({
      serviceRequest: request._id,
      status: "Approved"
    });

    if (!approvedQuote) {
      return res.status(400).json({
        success: false,
        message: "An approved quote is required before assignment"
      });
    }

    request.assignedTechnician = technician._id;
    request.assignedBy = req.user._id;
    request.assignedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: "Technician assigned successfully",
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  assignTechnician
};
