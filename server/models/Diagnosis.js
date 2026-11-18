
const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      unique: true
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    problemFound: {
      type: String,
      required: true,
      trim: true
    },

    rootCause: {
      type: String,
      default: ""
    },

    diagnosisNotes: {
      type: String,
      default: ""
    },

    recommendedSolution: {
      type: String,
      default: ""
    },

    estimatedRepairTime: {
      type: String,
      default: ""
    },

    partsRequired: [
      {
        name: String,
        quantity: {
          type: Number,
          default: 1
        }
      }
    ],

    evidence: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    diagnosedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Diagnosis", diagnosisSchema);
