// Import mongoose
const mongoose = require('mongoose');

// Define schema for lectures (nested in the Online schema)
const OnlineSchema = new mongoose.Schema({
  title :String ,
  video :String , 
  content :String

});

OnlineSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});




const Online = mongoose.model('online', OnlineSchema);

module.exports = Online;
