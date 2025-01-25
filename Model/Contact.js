

  const mongoose = require("mongoose")

const contactSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    reply_message: {
        type: String,
    },
    phone_number: {
        type: Number,
    },
    contact_status: {
        type: String,
        default: "unread"
    },
    role :String,
    created_at: {
        type: Date,
        default: Date.now
    },
    Email_verify: {
        type: String,
        // deafult: false
    }
})

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;