const mongoose = require('mongoose');

const TranningSchema = mongoose.Schema({
  title: String,
  video: String,
  content: String,
  webnair_date: String,
  thumbnail: String,
  place: String
}, { timestamps: true });

const VideoTraning = mongoose.model('tranning', TranningSchema);

module.exports = VideoTraning;
