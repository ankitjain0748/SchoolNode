const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    Skill: String,
    designation: String,
    sales: String,
    lessions: String,
    students: String,
    address: String,
    profileImage: String,  // For profile image
    gender: String,         // Gender
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Validates 10-digit phone numbers
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expertise: {
      type: [String], // Array of expertise topics
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    // courses: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Course", // Reference to Course Model
    //   },
    // ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Instructor", instructorSchema);
