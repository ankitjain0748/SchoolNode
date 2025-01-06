const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
    },
    password: {
        type: String,
        required: [true, "Password is required."]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
    },
    referral_code: {
        type: String,
    },
    referred_by: {
        type: String
    },
    referred_first: {
        type: String
    },
    referred_second: {
        type: String
    },
    country_code: {
        type: String,
        default: "IN"
    },
    phone_code: {
        type: String,
        default: "+91"
    },
    phone_number: {
        type: Number,
        required: [true, "Phone number is required."],
    },
    role: {
        type: String,
        required: [true, "Role is required."],
        default: "user"
    },
    user_status: {
        type: String,
        default: "registerd"
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    CourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    payment_data: String,
    payment_key :String ,  
    referred_user_pay : Number , 
    first_user_pay :Number , 
    second_user_pay :Number , 

});

const User = mongoose.model("User", userSchema);

module.exports = User;
