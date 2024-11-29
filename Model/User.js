const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
    },
    country_code: {
        type: String,
    },
    phone_code: {
        type: String,
    },
    state: {
        type: String,
    },
    phone_number: {
        type: Number,
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    enquiry_count: {
        type :Number
    },
    user_status: {
        type: String,
        default: "active"
    },
    verified: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now
    }

})

const User = mongoose.model("User", userSchema);

module.exports = User;