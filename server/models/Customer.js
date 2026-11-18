
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    city: {
      type: String,
      default: "",
      trim: true
    },
    notes: {
      type: String,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Customer", customerSchema);
