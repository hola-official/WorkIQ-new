const mongoose = require("mongoose");

const PendingVerification = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"], // Enum for status field
    default: "pending", // Default status
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: "15d",
  },
});

module.exports = mongoose.model("PendingVerification", PendingVerification);
