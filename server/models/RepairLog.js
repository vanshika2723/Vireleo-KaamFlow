
const mongoose = require("mongoose");

const repairLogSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true
    },

    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    workPerformed: {
      type: String,
      required: true,
      trim: true
    },

    partsUsed: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        unitCost: {
          type: Number,
          default: 0,
          min: 0
        }
      }
    ],

    timeSpent: {
      type: Number,
      default: 0,
      min: 0
    },

    technicianNotes: {
      type: String,
      default: ""
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("RepairLog", repairLogSchema);
