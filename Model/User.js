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
    passive_income: Number,
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
        default: "registered",
        enum: ["registered", "active", "inactive", "enrolled"]
    },
    payment_key :String,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    ref_date: {
        type: Date,
        default: Date.now
    },
    Email_verify: {
        type: String,
        // deafult: false
    },
    payment_Add: Number,
    referred_user_pay_overall: Number,
    referred_user_pay_monthly: Number,
    referred_user_pay_weekly: Number,
    referred_user_pay_daily: Number,
    payment_key_daily: Number,
    lastPaymentMonth: String,
    lastPaymentWeek: String,
    lastPaymentDay: String,
    paymentWidthrawal: Number,
    lastTodayIncome: Number,
    pervious_passive_income_month : Number,
    CourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    payment_data: Number,
    payment_key: String,
    referred_user_pay: Number,
    first_user_pay: Number,
    second_user_pay: Number,
    widthrawal_reason: String,
    success_reasons: String,
    transactionId: String,
    payment_reason: String,
    paymentMethod: String,
    OTP: Number,
    ActiveUserPrice: Number,
    InActiveUserPercanetage: Number,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
