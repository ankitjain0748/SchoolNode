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
    phone_number: {
        required: [true, "Phone number is required."],
        type: Number,
    },
    designation: {
        required: [true, "Designation is required."],
        type: String,
    },
    profileImage :String,
    bio: {
        type: String,
        required: [true, "Bio is required."],
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
