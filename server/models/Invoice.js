
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      unique: true
    },

    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    laborCost: {
      type: Number,
      required: true,
      min: 0
    },

    partsCost: {
      type: Number,
      required: true,
      min: 0
    },

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

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid"
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer", "Other"],
      default: "Other"
    },

    issuedAt: {
      type: Date,
      default: Date.now
    },

    paidAt: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ""
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

module.exports = mongoose.model("Invoice", invoiceSchema);
