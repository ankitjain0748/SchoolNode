// Import mongoose
const mongoose = require('mongoose');



const SubtitleSchema = mongoose.Schema({
  subtitle: {
    type: String,
    trim: true,
  },
  subcontent: {
    type: String,
    trim: true,
  },
  videoLink: {
    type: String,
    trim: true,
  },
});

const LectureSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  subtitles: {
    type: [SubtitleSchema],
    default: [],
  },
});
const Lecture = mongoose.model("Lecture", LectureSchema);



const lectureFilesSchema = new mongoose.Schema({
  subtitle: {
    type: String,
    trim: true,
  },
});

const lectureFiles = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  subtitles: {
    type: [lectureFilesSchema],
    default: [],
  },
});
const lectureFile = mongoose.model("lectureFiles", lectureFiles);
// Define the schema for a course
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  sub_content: {
    type: String,
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
  lectureFiles: [lectureFiles],
  // Onlines: [OnlineSchema],

  lectures: [LectureSchema],

  courseImage: {
    type: String, // File path or URL
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  firstuser: {
    type: Number,
    default: 0
  },
  seconduser: {
    type: Number,
    default: 0

  },
  percentage_passive: {
    type: Number,
    default: 0
  },
  directuser: {
    type: Number,
    default: 0

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
