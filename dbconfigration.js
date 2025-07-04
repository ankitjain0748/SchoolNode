const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./utill/Loggers");

dotenv.config();

mongoose.connect(process.env.DB_URL, {
   serverSelectionTimeoutMS: 500000, // 10 seconds timeout
   autoIndex: false,               
   maxPoolSize: 10,                
   socketTimeoutMS: 45000,         
   family: 4                       
})
.then(() => {
   logger.info('Connected to MongoDB');
})
.catch((err) => {
   logger.error(err)
});
