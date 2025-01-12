const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred_user_pay: {
      type: Number,
      required: true,
    },
    widthrawal_reason: {
      type: String,
      required: true,
    },
    success_reasons: {
      type: String,
      required: true,
    },
    payment_data: {
      type: Object, // You can customize this based on your data structure
      required: true,
    },
    payment_income: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
