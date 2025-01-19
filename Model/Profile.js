const mongoose = require("mongoose");

const Profile = mongoose.Schema({
    firstname: {
        type: String,
    },
    bsemail :String ,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    lastname: {
        type: String,
    },
    username: {
        type: String,
    },
    email :String,
    phone_number: {
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
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const ProfileData = mongoose.model("Profile", Profile);
module.exports = ProfileData;
