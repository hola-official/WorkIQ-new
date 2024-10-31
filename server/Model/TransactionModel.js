const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["deposit", "order_completed", "withdrawal", "earning"],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["card", "crypto"],
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  txHash: String,
  reference: { type: String },
  stripeTransferId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
