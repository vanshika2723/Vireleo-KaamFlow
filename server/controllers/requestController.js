
const ServiceRequest = require("../models/ServiceRequest");
const Customer = require("../models/Customer");
const Asset = require("../models/Asset");
const Diagnosis = require("../models/Diagnosis");
const RepairLog = require("../models/RepairLog");
const QC = require("../models/QC");
const User = require("../models/User");
const Quote = require("../models/Quote");

// Get workspace ID
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// Get request access scope
const getRequestScope = (user) => {
  if (["Admin", "Service Desk"].includes(user.role)) {
    const businessId = getWorkspaceId(user);

    return businessId
      ? { businessId }
      : { _id: null };
  }

  if (user.role === "Technician") {
    return { assignedTechnician: user._id };
  }

  return { createdBy: user._id };
};

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

    const isOperationsStaff = [
      "Admin",
      "Service Desk"
    ].includes(req.user.role);

    const businessId = isOperationsStaff
      ? getWorkspaceId(req.user)
      : null;

    if (isOperationsStaff && !businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a business workspace"
      });
    }

    const customerFilter = {
      _id: customer,
      isActive: true
    };

    if (isOperationsStaff) {
      customerFilter.businessId = businessId;
    } else {
      customerFilter.createdBy = req.user._id;
    }

    const customerExists = await Customer.findOne(customerFilter);

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found in your workspace"
      });
    }

    const assetFilter = {
      _id: asset,
      customer
    };

    if (isOperationsStaff) {
      assetFilter.businessId = businessId;
    } else {
      assetFilter.createdBy = req.user._id;
    }

    const assetExists = await Asset.findOne(assetFilter);

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
      createdBy: req.user._id,
      businessId: isOperationsStaff
        ? businessId
        : customerExists.businessId || null
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
    const requests = await ServiceRequest.find(
      getRequestScope(req.user)
    )
      .populate("customer", "name email phone")
      .populate("asset", "category brand model serialNumber")
      .populate("assignedTechnician", "name email phone role")
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
      ...getRequestScope(req.user)
    })
      .populate("customer", "name email phone address")
      .populate("asset", "category brand model serialNumber condition")
      .populate("assignedTechnician", "name email phone role");

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
      ...getRequestScope(req.user)
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found or access denied"
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
      }).sort({ createdAt: -1 });

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
          message: "Latest QC result does not match requested status"
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

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a business workspace"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: req.params.id,
      businessId
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const technician = await User.findOne({
      _id: technicianId,
      role: "Technician",
      businessId,
      isActive: true
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Active technician from your workspace not found"
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
