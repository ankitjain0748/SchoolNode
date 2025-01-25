const mongoose = require('mongoose');

const tempUserSchema =  mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  Email_verify: {
    type: String,
    // deafult: false
},
  phone_number: {
    type: String,
    required: true,
  },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referred_first: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  referred_second: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  OTP: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Expires in 10 minutes
  },
});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;
