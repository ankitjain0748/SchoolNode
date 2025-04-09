const mongoose = require('mongoose');

const OnlineSchema = mongoose.Schema({
  title: String,
  video: String,
  content: String,
  webnair_date: String,
  webnair_time: String,
  webniar_end_time: String,
  place: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Online = mongoose.model('webinar', OnlineSchema);

module.exports = Online;
