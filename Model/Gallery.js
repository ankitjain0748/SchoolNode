const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  short_content: {
    type: String,
  },
  Image: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Gallery', blogSchema);
