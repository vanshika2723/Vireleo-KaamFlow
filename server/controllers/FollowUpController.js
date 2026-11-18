
const FollowUp = require("../models/FollowUp");
const ServiceRequest = require("../models/ServiceRequest");

// CREATE FOLLOW-UP
const createFollowUp = async (req, res) => {
  try {
    const { requestId, scheduledAt } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Service request ID is required"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      createdBy: req.user._id,
      status: "Completed"
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Completed service request not found"
      });
    }

    const existingFollowUp = await FollowUp.findOne({
      serviceRequest: request._id
    });

    if (existingFollowUp) {
      return res.status(400).json({
        success: false,
        message: "Follow-up already exists for this request"
      });
    }

    const followUp = await FollowUp.create({
      serviceRequest: request._id,
      customer: request.customer,
      scheduledAt: scheduledAt || new Date(),
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      followUp
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL FOLLOW-UPS
const getFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({
      createdBy: req.user._id
    })
      .populate("customer", "name email phone")
      .populate("serviceRequest", "requestId status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE FOLLOW-UP
const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    })
      .populate("customer", "name email phone")
      .populate("serviceRequest");

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found"
      });
    }

    res.status(200).json({
      success: true,
      followUp
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// SUBMIT CUSTOMER OUTCOME
const submitOutcome = async (req, res) => {
  try {
    const {
      outcome,
      customerFeedback,
      rating
    } = req.body;

    const validOutcomes = [
      "Working as Expected",
      "Same Symptom Persists",
      "Partly Improved",
      "Different Issue",
      "Unknown"
    ];

    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer outcome"
      });
    }

    if (
      rating !== undefined &&
      rating !== null &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const followUp = await FollowUp.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found"
      });
    }

    followUp.outcome = outcome;
    followUp.customerFeedback = customerFeedback || "";
    followUp.rating = rating ?? null;
    followUp.responseStatus = "Responded";
    followUp.respondedAt = new Date();

    followUp.symptomReturned =
      outcome === "Same Symptom Persists";

    followUp.differentIssue =
      outcome === "Different Issue";

    await followUp.save();

    res.status(200).json({
      success: true,
      message: "Customer outcome submitted successfully",
      followUp
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const markNoResponse = async (req, res) => {
  try {
    const followUp = await FollowUp.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found"
      });
    }

    if (followUp.responseStatus === "Responded") {
      return res.status(400).json({
        success: false,
        message: "Customer has already responded"
      });
    }

    followUp.responseStatus = "No Response";
    await followUp.save();

    res.status(200).json({
      success: true,
      message: "Follow-up marked as no response",
      followUp
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
    submitOutcome,
    markNoResponse

};
