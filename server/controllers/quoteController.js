
const Quote = require("../models/Quote");
const ServiceRequest = require("../models/ServiceRequest");
const Diagnosis = require("../models/Diagnosis");

// CREATE QUOTE
const createQuote = async (req, res) => {
  try {
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

    const request = await ServiceRequest.findOne({
      _id: serviceRequest,
      createdBy: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Service request not found"
      });
    }

    const diagnosis = await Diagnosis.findOne({
      serviceRequest
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
      serviceRequest
    }).sort({ version: -1 });

    const quote = await Quote.create({
      serviceRequest,
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
    const quotes = await Quote.find({
      createdBy: req.user._id
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
    const quote = await Quote.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    })
      .populate("serviceRequest")
      .populate("diagnosis");

    if (!quote) {
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
const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Sent", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote status"
      });
    }

    const quote = await Quote.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found"
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
