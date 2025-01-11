
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
const contactRoute = require("./Route/Contact")
const SubscribeRoute = require("./Route/Subscribe")
const instrutorroute = require("./Route/Instructor")
const CourseRoute = require("./Route/Course")
const PaymentRoute = require("./Route/Payment")
const BlogRoute = require("./Route/BlogRoute")
const ReviewRoute = require("./Route/ReviewRoute")
const RefralRoute = require("./Route/RefralRoute");
const GalleryRoute = require("./Route/Gallery");

const Loggers = require("./utill/Loggers");


app.use("/user", userRoute)
app.use("/contact", contactRoute)
app.use("/subscribe", SubscribeRoute)
app.use("/instrutor", instrutorroute)
app.use("/course", CourseRoute)
app.use("/payment", PaymentRoute)
app.use("/blog", BlogRoute)
app.use("/review", ReviewRoute)
app.use("/refral", RefralRoute)
app.use("/gallery", GalleryRoute)


const PORT = process.env.REACT_APP_SERVER_DOMIN || 5000;

app.get("/", (req, res) => {
    res.json({
        msg: 'Hello Data maanage ',
        status: 200,
    });
});

app.listen(PORT, () => Loggers.http("Server is running at port : " + PORT));