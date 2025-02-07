const mongoose = require("mongoose");


userWidthrawal , userpay 
const transactionSchema =  mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred_user_pay: {
      type: Number,
    },
    payment_type :String,
    widthrawal_reason: {
      type: String,
    },
    success_reasons: {
      type: String,
    },
    payment_data: {
      type: String, // You can customize this based on your data structure
    },
    payment_income: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
