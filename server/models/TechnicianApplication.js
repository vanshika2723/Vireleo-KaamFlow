
const mongoose = require("mongoose");

const technicianApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    specialization: {
      type: String,
      required: true,
      trim: true
    },

    experience: {
      type: String,
      required: true,
      trim: true
    },

    skills: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    adminNotes: {
      type: String,
      default: ""
    },

    activationTokenHash: {
      type: String,
      default: null,
      select: false
    },

    activationTokenExpiry: {
      type: Date,
      default: null
    },

    activationCompletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

technicianApplicationSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model(
  "TechnicianApplication",
  technicianApplicationSchema
);
