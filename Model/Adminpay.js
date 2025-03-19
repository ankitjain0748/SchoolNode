const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        default: "", // Default empty string
    },
    payment_reason: {
        type: String,
        default: "General Payment",
    },
    paymentMethod: {
        type: String,
        default: "Credit Card",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    payment_key: {
        type: Number,
        default: 0,
    },
    withdrawal_reason: {
        type: String,
        default: "",
    },
    success_reasons: {
        type: String,
        default: "",
    },
    payment_data: {
        type: Number,
        default: 0,
    },
    payment_income: {
        type: String,
        default: "0",
    },
    payment_type: {
        type: String,
        default: "Deposit",
    },
    payment_Add: {
        type: Number,
        default: 0,
    },
    paymentWidthrawal: {
        type: Number,
        default: 0,
    },
    page: {
        type: String,
        default: "Dashboard",
    },
    data_payment: {
        type: Number,
        default: 0,
    },
    payment_date: {
        type: Date,
        default: Date.now,
    },
    receipt: {
        type: String,
        default: "",
    }
});

const Payment = mongoose.model('AdminPayment', paymentSchema);

module.exports = Payment;
