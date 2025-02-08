const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    transactionId: String,
    payment_reason: String,
    paymentMethod: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    payment_key :Number,
    withdrawal_reason:String,
    success_reasons:String,
    payment_data: Number,
    payment_income: String, 
    payment_type :String,
    page:String,
    data_payment: Number,
    payment_date: {
        type: Date,
        default: Date.now,
    },
    receipt: String
});
const Payment = mongoose.model('AdminPayment', paymentSchema);

module.exports = Payment;