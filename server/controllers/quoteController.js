
const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");
const Diagnosis = require("../models/Diagnosis");

const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// CHECK REQUEST ACCESS
const getAccessibleRequest = async (serviceRequest, user) => {
  const isOperationsStaff = [
    "Admin",
    "Service Desk"
  ].includes(user.role);

  if (!isOperationsStaff) return null;

  const businessId = getWorkspaceId(user);

  if (!businessId) return null;

  return ServiceRequest.findOne({
    _id: serviceRequest,
    businessId
  });
};

// CREATE QUOTE
const createQuote = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can create quotes"
      });
    }

    const {
      serviceRequest,
      laborCost,
      parts,
      additionalCharges,
      estimatedCompletion,
      terms
    } = req.body;

    if (!serviceRequest || laborCost === undefined) {
      return res.status(400).json({
        success: false,
        message: "Service request and labor cost are required"
      });
    }

    const request = await getAccessibleRequest(
      serviceRequest,
      req.user
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found in your workspace"
      });
    }

    const diagnosis = await Diagnosis.findOne({
      serviceRequest: request._id
    });

    if (!diagnosis) {
      return res.status(400).json({
        success: false,
        message: "Complete diagnosis before creating quote"
      });
    }

    if (
      !Number.isFinite(Number(laborCost)) ||
      Number(laborCost) < 0 ||
      !Number.isFinite(Number(additionalCharges || 0)) ||
      Number(additionalCharges || 0) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid cost values"
      });
    }

    const quoteParts = parts || [];

    if (!Array.isArray(quoteParts)) {
      return res.status(400).json({
        success: false,
        message: "Parts must be an array"
      });
    }

    for (const part of quoteParts) {
      if (
        !part.name ||
        !Number.isInteger(Number(part.quantity)) ||
        Number(part.quantity) < 1 ||
        !Number.isFinite(Number(part.unitPrice)) ||
        Number(part.unitPrice) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid part details"
        });
      }
    }

    const partsTotal = quoteParts.reduce(
      (sum, part) =>
        sum + Number(part.quantity) * Number(part.unitPrice),
      0
    );

    const totalAmount =
      Number(laborCost) +
      partsTotal +
      Number(additionalCharges || 0);

    const latestQuote = await Quote.findOne({
      serviceRequest: request._id
    }).sort({ version: -1 });

    const quote = await Quote.create({
      serviceRequest: request._id,
      diagnosis: diagnosis._id,
      version: latestQuote ? latestQuote.version + 1 : 1,
      laborCost: Number(laborCost),
      parts: quoteParts,
      additionalCharges: Number(additionalCharges || 0),
      totalAmount,
      estimatedCompletion,
      terms,
      status: "Draft",
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Quote created successfully",
      quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL QUOTES
const getQuotes = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access quotes"
      });
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a workspace"
      });
    }

    const requests = await ServiceRequest.find({
      businessId
    }).select("_id");

    const requestIds = requests.map((request) => request._id);

    const quotes = await Quote.find({
      serviceRequest: { $in: requestIds }
    })
      .populate("serviceRequest", "requestId reportedSymptom status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      quotes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE QUOTE
const getQuoteById = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this quote"
      });
    }

    const businessId = getWorkspaceId(req.user);

    const quote = await Quote.findById(req.params.id)
      .populate("serviceRequest")
      .populate("diagnosis");

    if (
      !quote ||
      !businessId ||
      quote.serviceRequest?.businessId?.toString() !== businessId.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Quote not found"
      });
    }

    res.status(200).json({
      success: true,
      quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE QUOTE STATUS
const updateQuoteStatus = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can update quote status"
      });
    }

    const { status } = req.body;

    if (!["Sent", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote status"
      });
    }

    const businessId = getWorkspaceId(req.user);

    const quote = await Quote.findById(req.params.id)
      .populate("serviceRequest");

    if (
      !quote ||
      !businessId ||
      quote.serviceRequest?.businessId?.toString() !== businessId.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Quote not found in your workspace"
      });
    }

    const allowedTransitions = {
      Draft: ["Sent"],
      Sent: ["Approved", "Rejected"]
    };

    if (!allowedTransitions[quote.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change quote from ${quote.status} to ${status}`
      });
    }

    quote.status = status;

    if (status === "Approved") {
      quote.approvedAt = new Date();
    }

    await quote.save();

    res.status(200).json({
      success: true,
      message: "Quote status updated successfully",
      quote
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuoteStatus
};
