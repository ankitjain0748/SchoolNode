const mongoose = require("mongoose");

const BankSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    BankName: {
        type: String,
        required: [true, "Bank name is required."],
        trim: true,
        default: "Unknown Bank", // Default value
    },
    BankNumber: {
        type: String,
        required: [true, "Bank account number is required."],
        unique: true, // Ensures no duplicate accounts
        trim: true,
        default: "0000000000", // Default account number
    },
    BranchName: {
        type: String,
        required: [true, "Branch name is required."],
        trim: true,
        default: "Main Branch", // Default branch name
    },
    IFSC: {
        type: String,
        required: [true, "IFSC code is required."],
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date
    }
});

const Bank = mongoose.model("Bank", BankSchema);
module.exports = Bank;
