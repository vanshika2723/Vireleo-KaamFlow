
const mongoose = require("mongoose");

const qcSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      unique: true
    },

    repairLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairLog",
      required: true
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    checks: [
      {
        item: {
          type: String,
          required: true
        },

        passed: {
          type: Boolean,
          required: true
        },

        remarks: {
          type: String,
          default: ""
        }
      }
    ],

    result: {
      type: String,
      enum: ["Pending", "Passed", "Failed"],
      default: "Pending"
    },

    overallNotes: {
      type: String,
      default: ""
    },

    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("QC", qcSchema);
