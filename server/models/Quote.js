
const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true
    },

    diagnosis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diagnosis",
      required: true
    },

    version: {
      type: Number,
      default: 1
    },

    laborCost: {
      type: Number,
      required: true,
      min: 0
    },

    parts: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    additionalCharges: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    estimatedCompletion: {
      type: String,
      default: ""
    },

    terms: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Approved",
        "Rejected",
        "Expired"
      ],
      default: "Draft"
    },

    approvedAt: {
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

quoteSchema.index(
  { serviceRequest: 1, version: 1 },
  { unique: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
