const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
    required: true,
  },
  GST_Number: {
    type: Number,
  },
   CourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required."],
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required."],
},
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default :"INR"
  },
  status: {
    type: String,
    default: 'pending',
  },
  payment_status: {
    type: String,
    default: 'pending',
  },
  product_name: {
    type: String,
  },
  payment_method: {
    type: String,
  },
  type: {
    type: String,
  },
  payment_date: {
    type: Date,
    default: Date.now,
  },
  receipt :String,
  created_at: {
    type: Date,
    default: Date.now
},
reffer_direct_user_pay: { type: Number, default: 0 },
reffer_first_user_pay: { type: Number, default: 0 },
reffer_second_user_pay: { type: Number, default: 0 },

});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;