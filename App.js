
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
        msg: 'Hello StackEarn Website',
        status: 200,
    });
});

cron.schedule('0 0 * * *', async () => {
    // 🟢 DAILY CRON JOB (Runs every day at midnight)
    try {
        console.log('Running daily payment reset job...');
        const currentDay = moment().format('YYYY-MM-DD');
        const users = await User.find({ role: "user" });
        Loggers.info("Done Cron Daliy")
        for (let user of users) {
            let updates = {};

            if (user.lastPaymentDay !== currentDay) {
                updates.UnPaidAmounts = (user.lastTodayIncome || 0)
                updates.lastTodayIncome = (user.lastTodayIncome || 0) + (user.referred_user_pay_daily || 0) + (user.referred_user_pay);
                updates.referred_user_pay_overall = (user.lastTodayIncome || 0) + (user.referred_user_pay_overall || 0) + (user.referred_user_pay);
                updates.referred_user_pay_monthly = (user.lastTodayIncome || 0) + (user.referred_user_pay_monthly || 0) + (user.referred_user_pay);
                updates.referred_user_pay_weekly = (user.lastTodayIncome || 0) + (user.referred_user_pay_weekly || 0) + (user.referred_user_pay);
                updates.referred_user_pay_daily = (user.lastTodayIncome || 0) + (user.referred_user_pay_daily || 0) + (user.referred_user_pay);
                updates.passive_income = (user.second_user_pay || 0) + (user.first_user_pay) + (updates.passive_income || 0);
                updates.referred_user_pay_daily = 0;
                updates.referred_user_pay = 0;
                updates.lastPaymentDay = currentDay;
            }

            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates, { new: true });
            }
        }
        const from = "StackEarn Cron Daily <no-reply@stackearn.com>";
        console.log('✅ Daily payment reset job completed.');
        await sendEmail({
            email: "ankitkumarjain0748@gmail.com",
            name: "Admin",
            message: "The daily payment reset job has been successfully completed at midnight.",
            subject: "✅ Daily Cron Job Completed",
            emailTemplate: CronEmail,
            from: from
        });
        await sendEmail({
            email: "sainibhim133@gmail.com",
            name: "Admin",
            message: "The daily payment reset job has been successfully completed at midnight.",
            subject: "✅ Daily Cron Job Completed",
            emailTemplate: CronEmail,
            from: from
        });
    } catch (error) {
        console.error('❌ Error in daily payment reset job:', error);
    }
});

cron.schedule('8 0 * * 1', async () => {
    // 🟡 WEEKLY CRON JOB (Runs every Sunday at midnight) Let me know what day/time you want exactly (Sunday night, Monday morning, etc.) and I’ll lock it in precisely.
    console.log('⏰ Weekly job running at 12:08 AM on Sunday');
    try {
        console.log('Running weekly payment reset job...');
        const currentWeek = moment().format('YYYY-WW');
        const users = await User.find({ role: "user" });

        for (let user of users) {
            let updates = {};
            if (user.lastPaymentWeek !== currentWeek) {
                updates.referred_user_pay_weekly = 0;
                updates.lastPaymentWeek = currentWeek;
            }
            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates, { new: true });
            }
        }

        console.log('✅ Weekly payment reset job completed.');
        const from = "StackEarn  Cron Weekly<no-reply@stackearn.com>";

        await sendEmail({
            email: "ankitkumarjain0748@gmail.com",
            name: "Admin",
            message: "The weekly payment reset job has been successfully completed at midnight.",
            subject: "✅ Weekly Cron Job Completed",
            emailTemplate: CronEmail,
            from: from
        });

    } catch (error) {
        console.error('❌ Error in weekly payment reset job:', error);
    }
});

cron.schedule('15 0 28-31 * *', async () => {
    // 🔴 MONTHLY CRON JOB (Runs at midnight on the last day of the month)  Runs at 12:15 AM on 28th, 29th, 30th, and 31st of each month
    const today = moment();
    if (today.date() !== today.endOf('month').date()) {
        return; // Only run on the last day of the month
    }
    try {
        console.log('Running monthly payment reset job...');
        const currentMonth = moment().format('YYYY-MM');
        const users = await User.find({ role: "user" });

        for (let user of users) {
            let updates = {};
            if (user.lastPaymentMonth !== currentMonth) {
                updates.referred_user_pay_monthly = 0;
                updates.lastTodayIncome = (user.lastTodayIncome || 0) + (user.second_user_pay || 0) + (user.first_user_pay);
                updates.pervious_passive_income_month = (user.second_user_pay || 0) + (user.first_user_pay);
                updates.lastPaymentMonth = currentMonth;
                updates.second_user_pay = 0;
                updates.first_user_pay = 0;
            }
            if (Object.keys(updates).length > 0) {
                await User.findByIdAndUpdate(user._id, updates, { new: true });
            }
        }

        console.log('✅ Monthly payment reset job completed.');
        const from = "StackEarn  Cron Monthly <no-reply@stackearn.com>";

        await sendEmail({
            email: "ankitkumarjain0748@gmail.com",
            name: "Admin",

            message: "The monthly payment reset job has been successfully completed.",
            subject: "✅ Monthly Cron Job Completed",
            emailTemplate: CronEmail,
            from: from
        });

    } catch (error) {
        console.error('❌ Error in monthly payment reset job:', error);
    }
});

app.listen(PORT, () => Loggers.http("Server is running at port : " + PORT));