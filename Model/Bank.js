const mongoose = require("mongoose");

const BankSchema =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    bankName: {
        type: String,
        required: [true, "Bank name is required."],
        trim: true,
        default: "Unknown Bank", // Default value
    },
    bankNumber: {
        type: String,
        required: [true, "Bank account number is required."],
        unique: true, // Ensures no duplicate accounts
        trim: true,
        default: "0000000000", // Default account number
    },
    branchName: {
        type: String,
        required: [true, "Branch name is required."],
        trim: true,
        default: "Main Branch", // Default branch name
    },
    IFSC: {
        type: String,
        required: [true, "IFSC code is required."],
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"], // Validates IFSC format
        trim: true,
        default: "XXXX0000000", // Default IFSC code
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date
    }
});

const Bank = mongoose.model("Bank", BankSchema);
module.exports = Bank;
