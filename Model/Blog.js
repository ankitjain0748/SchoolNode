const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
  },
  short_content: {
    type: String,
    required: true,
  },
  Image: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  meta_title: String,
  meta_description: String,
  meta_keyword: String,
});

module.exports = mongoose.model('Blog', blogSchema);
