
const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Air Conditioner",
        "Refrigerator",
        "Washing Machine",
        "Microwave",
        "Television",
        "UPS/Inverter",
        "Electronics",
        "Other"
      ]
    },

    brand: {
      type: String,
      required: true,
      trim: true
    },

    model: {
      type: String,
      default: "",
      trim: true
    },

    serialNumber: {
      type: String,
      default: "",
      trim: true
    },

    purchaseDate: {
      type: Date,
      default: null
    },

    condition: {
      type: String,
      enum: ["Good", "Fair", "Poor", "Not Working"],
      default: "Not Working"
    },

    description: {
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

module.exports = mongoose.model("Asset", assetSchema);
