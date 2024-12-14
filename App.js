
const dotenv = require("dotenv");
require("./dbconfigration");
dotenv.config();

const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "*", // Allowed origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*', // Allow all headers
    credentials: true,
    optionsSuccessStatus: 200, // for legacy browsers
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '2000mb' }));
app.use(express.urlencoded({ extended: true }));

const userRoute = require("./Route/User")
const contactRoute  = require("./Route/Contact") 
const SubscribeRoute  = require("./Route/Subscribe") 
const instrutorroute  =require("./Route/Instructor")
 

app.use("/user", userRoute)
app.use("/contact", contactRoute)
app.use("/subscribe" ,SubscribeRoute)
app.use("/instrutor",instrutorroute)
const PORT = 8000;

app.get("/", (req, res) => {
    res.json({
        msg: 'Okay',
        status: 200,
    });
});

app.listen(PORT, () => console.log("Server is running at port : " + PORT));
