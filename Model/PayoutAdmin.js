const mongoose = require('mongoose');

const payoutAdminSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    transactionId: {
        type: String,
        default: "", // Default empty string
    },
    amount: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        default: "Credit Card",
    },
    income_type: {
        type: String,
        default: "direct income",
    },
    payment_reasons: {
        type: String,
        default: "",
    },

}, {
    timestamps: true // <-- Yeh line timestamps add karegi
});

const payoutAdmin = mongoose.model('payoutAdmin', payoutAdminSchema);

module.exports = payoutAdmin;
