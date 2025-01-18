// Import mongoose
const mongoose = require('mongoose');

// Define schema for lectures (nested in the Online schema)
const TranningSchema = new mongoose.Schema({
  title: String,
  video: String,
  content: String,
  webnair_date: String,
  place: String
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create a model for webinars
const VideoTraning = mongoose.model('Tranning', TranningSchema);

module.exports = VideoTraning;
