const mongoose = require("mongoose")


const RefralSchema = mongoose.Schema({

    referral_code: {
        type: String,
        required: true
    },
    referred_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    referred_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        default: "Active",
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}

)


const Refral = mongoose.model("Refral", RefralSchema);

module.exports = Refral;