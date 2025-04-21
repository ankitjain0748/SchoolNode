const mongoose = require('mongoose');

const widthrawalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    widthrawal_reasons: {
        type: String,
        default: "",
    },
    amount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true // <-- Yeh line timestamps add karegi
});

const widthrawal = mongoose.model('widthrawalAdmin', widthrawalSchema);

module.exports = widthrawal;
