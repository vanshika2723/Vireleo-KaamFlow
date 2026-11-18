
const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    scheduledAt: {
      type: Date,
      default: Date.now
    },

    sentAt: {
      type: Date,
      default: null
    },

    responseStatus: {
      type: String,
      enum: ["Pending", "Responded", "No Response"],
      default: "Pending"
    },

    outcome: {
      type: String,
      enum: [
        "Working as Expected",
        "Same Symptom Persists",
        "Partly Improved",
        "Different Issue",
        "Unknown"
      ],
      default: "Unknown"
    },

    customerFeedback: {
      type: String,
      trim: true,
      default: ""
    },

    symptomReturned: {
      type: Boolean,
      default: false
    },

    differentIssue: {
      type: Boolean,
      default: false
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    respondedAt: {
      type: Date,
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("FollowUp", followUpSchema);
