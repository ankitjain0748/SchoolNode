const mongoose = require("mongoose");

const ReviewSection = mongoose.Schema({

    message: {
        type: String,
        required: [true, "Message is required"],
    },
    status: {
        type: String,
        enum: ["unread", "read"],
        default: "unread",
    },
    rating: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Ensure this matches the User collection
    },
    CourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", // Ensure this matches the Course collection
    },

});

const Review = mongoose.model("Review", ReviewSection);
module.exports = Review;
