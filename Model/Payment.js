const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  payment_id: { type: String, required: true },
  GST_Number: { type: Number },
  referredData1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userType: { type: String, enum: ["directuser"], default: null },
    payAmount: { type: Number, default: 0 },
  },
  referredData2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userType: { type: String, enum: ["firstuser"], default: null },
    payAmount: { type: Number, default: 0 },
  },
  referredData3: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userType: { type: String, enum: ["seconduser"], default: null },
    payAmount: { type: Number, default: 0 },
  },
  CourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  referred_user_type: { type: String, default: 'direct' },
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, default: 'pending' },
  payment_status: { type: String, default: 'pending' },
  product_name: { type: String },
  payment_method: { type: String },
  type: { type: String },

  reffer_direct_user_pay: { type: Number, default: 0 },
  reffer_first_user_pay: { type: Number, default: 0 },
  reffer_second_user_pay: { type: Number, default: 0 },

  payment_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
