const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        default: ""  
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        default: ""
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        default: ""
    },
    referral_code: {
        type: String,
        default: ""
    },
    referred_by: {
        type: String,
        default: ""
    },
    referred_first: {
        type: String,
        default: ""
    },
    referred_second: {
        type: String,
        default: ""
    },
    passive_income: {
        type: Number,
        default: 0
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
        default: "registered",
        enum: ["registered", "active", "inactive", "enrolled"]
    },
    payment_key: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
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
        default: ""
    },
    payment_Add: {
        type: Number,
        default: 0
    },
    referred_user_pay_overall: {
        type: Number,
        default: 0
    },
    referred_user_pay_monthly: {
        type: Number,
        default: 0
    },
    referred_user_pay_weekly: {
        type: Number,
        default: 0
    },
    referred_user_pay_daily: {
        type: Number,
        default: 0
    },
    payment_key_daily: {
        type: Number,
        default: 0
    },
    lastPaymentMonth: {
        type: String,
        default: ""
    },
    lastPaymentWeek: {
        type: String,
        default: ""
    },
    lastPaymentDay: {
        type: String,
        default: ""
    },
    paymentWidthrawal: {
        type: Number,
        default: 0
    },
    lastTodayIncome: {
        type: Number,
        default: 0
    },
    pervious_passive_income_month: {
        type: Number,
        default: 0
    },
    CourseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null
    },
    payment_data: {
        type: Number,
        default: 0
    },
    referred_user_pay: {
        type: Number,
        default: 0
    },
    first_user_pay: {
        type: Number,
        default: 0
    },
    second_user_pay: {
        type: Number,
        default: 0
    },
    widthrawal_reason: {
        type: String,
        default: ""
    },
    success_reasons: {
        type: String,
        default: ""
    },
    transactionId: {
        type: String,
        default: ""
    },
    payment_reason: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        default: ""
    },
    OTP: {
        type: Number,
        default: 0
    },
    ActiveUserPrice: {
        type: Number,
        default: 0
    },
    InActiveUserPercanetage: {
        type: Number,
        default: 0
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
