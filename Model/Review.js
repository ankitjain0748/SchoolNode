const mongoose = require("mongoose");

const ReviewSection = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    message: {
        type: String,
        required: [true, "Message is required"],
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
    },
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Review = mongoose.model("Subscribe", ReviewSection);
module.exports = Review;
