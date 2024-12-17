// Import mongoose
const mongoose = require('mongoose');

// Define the schema for a course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  //   instructor: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'User', // Assuming a User model exists for instructors
  //     required: [true, 'Instructor is required']
  //   },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    // enum: ['Programming', 'Design', 'Marketing', 'Business', 'Others'], // Example categories
    default: 'Others'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour'] // Duration in hours
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  level: {
    type: String,
    // enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: false
  },

  courseImage: String
});

// Middleware to update the updatedAt field on save
courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the Course model
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
