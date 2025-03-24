
const dotenv = require("dotenv");
require("./dbconfigration");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const moment = require('moment');
const cron = require('node-cron');
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
const User = require("./Model/User")
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
const CronEmail = require("./Mail/CronEmail");
const sendEmail = require("./utill/Emailer");
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

cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily payment reset job...');
        const currentDate = moment();
        const currentMonth = currentDate.format('YYYY-MM');
        const currentWeek = currentDate.format('YYYY-WW');
        const currentDay = currentDate.format('YYYY-MM-DD');
        const users = await User.find({ role: "user" });
        for (let user of users) {
            let updates = {};
            if (user.lastPaymentDay !== currentDay) {
                updates.lastTodayIncome = (user.lastTodayIncome || 0) + (user.referred_user_pay_daily || 0) + (user.referred_user_pay);
                updates.referred_user_pay_overall = (user.lastTodayIncome || 0) + (user.referred_user_pay_overall || 0) + (user.referred_user_pay);
                updates.referred_user_pay_monthly = (user.lastTodayIncome || 0) + (user.referred_user_pay_monthly || 0) + (user.referred_user_pay);
                updates.referred_user_pay_weekly = (user.lastTodayIncome || 0) + (user.referred_user_pay_weekly || 0) + (user.referred_user_pay);
                updates.referred_user_pay_daily = 0;
                updates.payment_key_daily = 0;
                updates.referred_user_pay = 0;
                updates.lastPaymentDay = currentDay;
            }

            if (user.lastPaymentWeek !== currentWeek) {
                updates.referred_user_pay_weekly = 0;
                updates.lastPaymentWeek = currentWeek;
            }
            if (user.lastPaymentMonth !== currentMonth) {
                updates.referred_user_pay_monthly = 0;
                updates.pervious_passive_income_month = (user.second_user_pay || 0) + (user.first_user_pay);
                user.second_user_pay = 0;
                user.first_user_pay = 0;
                updates.lastPaymentMonth = currentMonth;
            }
            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates, { new: true });
            }
        }
        console.log('Payment reset job completed successfully.');
        const subject = "✅ Daily Cron Job Completed";
        await sendEmail({
            email: "ankitkumarjain0748@gmail.com",
            name: "Admin",
            message: "The daily payment reset job has been successfully completed at midnight.",
            subject: subject,
            emailTemplate: CronEmail,
        });
        await sendEmail({
            email: "sainibhim133@gmail.com",
            name: "Admin",
            message: "The daily payment reset job has been successfully completed at midnight.",
            subject: subject,
            emailTemplate: CronEmail,
        });
    } catch (error) {
        console.error('Error running payment reset job:', error);
    }
});

app.listen(PORT, () => Loggers.http("Server is running at port : " + PORT));