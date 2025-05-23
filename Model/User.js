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
        default: "0000000000"
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
        deafult: false
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
    },
    payment_data: {
        type: Number,
        default: 0
    },
    payment_key: {
        type: String,
        default: ""
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
    OTP: {
        type: Number,
        default: null
    },
    ActiveUserPrice: {
        type: Number,
        default: 0
    },
    InActiveUserPercanetage: {
        type: Number,
        default: 0
    },
    InActivePercentageamount: {
        type: Number,
        default: 0
    },
    UnPaidAmounts: {
        type: Number,
        default: 0
    },
    TodayPayment: {
        type: Number,
        default: 0
    },
    totalPayout: {
        type: Number,
        default: 0
    },
    totalWidthrawal: {
        type: Number,
        default: 0
    },
    totalAdd: {
        type: Number,
        default: 0
    },
    paymentmanage :{
        type: Number,
        default: 0
    },
    referred_user_type: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
