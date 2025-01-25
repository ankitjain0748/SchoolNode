

const mongoose = require("mongoose")

const subscribeSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "unread"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    Email_verify: {
        type: String,
        // deafult: false
    }
})

const Subscribe = mongoose.model("Subscribe", subscribeSchema);
module.exports = Subscribe;