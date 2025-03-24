const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone_number: { type: String, required: true },
  referred_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referred_first: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  referred_second: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  OTP: { type: String, required: true },
  Email_verify: { type: String, default: "false" },
  referral_code: { type: String },
});

const TempUser = mongoose.model("TempUser", tempUserSchema);

module.exports = TempUser;
