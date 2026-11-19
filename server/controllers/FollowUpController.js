
const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");
const ServiceRequest = require("../models/ServiceRequest");

// WORKSPACE HELPER
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// GET ACCESSIBLE FOLLOW-UP
const getAccessibleFollowUp = async (id, user) => {
  const businessId = getWorkspaceId(user);

  if (!businessId) return null;

  const followUp = await FollowUp.findById(id)
    .populate("serviceRequest");

  if (
    !followUp ||
    !followUp.serviceRequest ||
    followUp.serviceRequest.businessId?.toString() !==
      businessId.toString()
  ) {
    return null;
  }

  return followUp;
};

// CREATE FOLLOW-UP
const createFollowUp = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can create follow-ups"
      });
    }

    const { requestId, scheduledAt } = req.body;

    if (!requestId || !mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Valid service request ID is required"
      });
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a workspace"
      });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      businessId,
      status: "Completed"
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Completed service request not found in your workspace"
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
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access follow-ups"
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

    const requestIds = requests.map(
      (request) => request._id
    );

    const followUps = await FollowUp.find({
      serviceRequest: { $in: requestIds }
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
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this follow-up"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID"
      });
    }

    const followUp = await getAccessibleFollowUp(
      req.params.id,
      req.user
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found in your workspace"
      });
    }

    await followUp.populate("customer", "name email phone");

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
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can submit outcomes"
      });
    }

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
      (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID"
      });
    }

    const followUp = await getAccessibleFollowUp(
      req.params.id,
      req.user
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found in your workspace"
      });
    }

    if (followUp.responseStatus === "Responded") {
      return res.status(400).json({
        success: false,
        message: "Customer outcome has already been submitted"
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

// MARK NO RESPONSE
const markNoResponse = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Service Desk can update follow-ups"
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID"
      });
    }

    const followUp = await getAccessibleFollowUp(
      req.params.id,
      req.user
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found in your workspace"
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
