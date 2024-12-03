

const mongoose = require("mongoose")

const subscribeSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

const Subscribe = mongoose.model("Subscribe", subscribeSchema);
module.exports = Contact;