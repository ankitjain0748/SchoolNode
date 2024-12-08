const mongoose = require("mongoose")


const BankSchema =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    BankName :String,
    BankNumber :String,
    BranchName :String,
    IFSC :String
})

const Bank = mongoose.model("Bank", BankSchema);
module.exports = Bank;