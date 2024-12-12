const mongoose = require("mongoose");

const Profile = mongoose.Schema({
    firstname: {
        required: [true, "First name is required."],
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    lastname: {
        required: [true, "Last name is required."],
        type: String,
    },
    username: {
        type: String,
    },
    email :String,
    phone_number: {
        required: [true, "Phone number is required."],
        type: Number,
    },
    policy:String,
    term:String,
    designation: {
        type: String,
    },
    profileImage :String,
    bio: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Address is required."],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const ProfileData = mongoose.model("Profile", Profile);
module.exports = ProfileData;
