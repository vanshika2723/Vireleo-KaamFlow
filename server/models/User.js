
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: [
        "Admin",
        "Service Desk",
        "Technician",
        "QC Reviewer",
        "Customer"
      ],
      default: "Service Desk"
    },

    // Shared workspace identification
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    phone: {
      type: String,
      default: ""
    },

    businessName: {
      type: String,
      default: ""
    },

    businessAddress: {
      type: String,
      default: ""
    },

    notificationPreferences: {
      newRequest: {
        type: Boolean,
        default: true
      },
      repairUpdates: {
        type: Boolean,
        default: true
      },
      paymentUpdates: {
        type: Boolean,
        default: true
      },
      customerFeedback: {
        type: Boolean,
        default: false
      }
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

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
