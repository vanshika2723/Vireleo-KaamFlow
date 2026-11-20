
const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true
    },

    reportedSymptom: {
      type: String,
      required: true,
      trim: true
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal"
    },

    preferredDate: {
      type: Date,
      default: null
    },

    serviceAddress: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Needs Review",
        "Accepted",
        "Needs More Information",
        "Out of Coverage",
        "Declined",
        "Open",
        "In Diagnosis",
        "Diagnosis Completed",
        "Repair In Progress",
        "Repair Completed",
        "QC Passed",
        "QC Failed",
        "Ready for Handover",
        "Completed"
      ],
      default: "Needs Review"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Shared business workspace
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    assignedAt: {
      type: Date,
      default: null
    },
        stageTimestamps: {
      requestReceivedAt: {
        type: Date,
        default: Date.now
      },
      diagnosisStartedAt: {
        type: Date,
        default: null
      },
      diagnosisCompletedAt: {
        type: Date,
        default: null
      },
      quoteSentAt: {
        type: Date,
        default: null
      },
      approvedAt: {
        type: Date,
        default: null
      },
      repairStartedAt: {
        type: Date,
        default: null
      },
      repairCompletedAt: {
        type: Date,
        default: null
      },
      qcPassedAt: {
        type: Date,
        default: null
      },
      readyForHandoverAt: {
        type: Date,
        default: null
      },
      completedAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);
