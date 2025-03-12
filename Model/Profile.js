const mongoose = require("mongoose");

const Profile = mongoose.Schema({
    bsemail :String ,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
    },
    email :String,
    phone_number: {
        type: Number,
    },
    firstname :String ,
    lastname :String ,
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
