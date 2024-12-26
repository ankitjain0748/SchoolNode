// Import mongoose
const mongoose = require('mongoose');

// Define schema for lectures (nested in the course schema)
const SubtitleSchema = new mongoose.Schema({
  subtitle: {
    type: String,
    trim: true,
    required: true,
  },
  videoLink: {
    type: String,
    trim: true,
    required: true,
  },
});

const OnlineTitleSchema = new mongoose.Schema({
  onlinetitle: {
    type: String,
    trim: true,
    required: true,
  },
  videoLink: {
    type: String,
    trim: true,
    required: true,
  },
});


const OnlineSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  subtitles: {
    type: [OnlineTitleSchema],
    default: [],
  },
});
const Online = mongoose.model("Online", OnlineSchema);

const LectureSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
  },
  subtitles: {
    type: [SubtitleSchema],
    default: [],
  },
});
const Lecture = mongoose.model("Lecture", LectureSchema);
// Define the schema for a course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    default: 'Others',
  },
  duration: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  lectureFiles: [
    {
      name: String, // File name
      filePath: String, // Path or URL for the lecture file
    },
  ],
  Onlines: [OnlineSchema],
  lectures: [LectureSchema], 
  
  courseImage: {
    type: String, // File path or URL
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  courseVideo: String,
  InstrutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: [true, "Instructor ID is required."],
  },
});

courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
