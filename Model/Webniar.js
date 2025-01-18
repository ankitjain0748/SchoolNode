// Import mongoose
const mongoose = require('mongoose');

// Define schema for lectures (nested in the Online schema)
const OnlineSchema =  mongoose.Schema({
  title: String,
  video: String,
  content: String,
  webnair_date: String,
  webnair_time: String,

  place: String
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create a model for webinars
const Online = mongoose.model('webinar', OnlineSchema);

module.exports = Online;
