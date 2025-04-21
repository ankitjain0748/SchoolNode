const mongoose = require('mongoose');

const AddSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    success_reasons: {
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

const Add = mongoose.model('AddAdmin', AddSchema);

module.exports = Add;
