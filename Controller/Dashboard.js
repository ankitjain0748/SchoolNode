const User = require("../Model/User");
const AdminPayment = require("../Model/Adminpay");
const catchAsync = require("../utill/catchAsync");
const Payment = require("../Model/Payment");

exports.AdminDashboard = catchAsync(async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const registeredCount = await User.countDocuments({ user_status: "registered" });
        const activeCount = await User.countDocuments({ user_status: "active" });
        const inactiveCount = await User.countDocuments({ user_status: "inactive" });
        const enrolledCount = await User.countDocuments({ user_status: "enrolled" });
        const totalusercount = await User.countDocuments({});
        const totaluserIncome = await User.aggregate([
            {
                $group: {
                    _id: null,
                    lastTodayIncome: { $sum: "$lastTodayIncome" },
                    referred_user_pay_daily: { $sum: "$referred_user_pay_daily" },
                    referred_user_pay_weekly: { $sum: "$referred_user_pay_weekly" },
                    referred_user_pay_monthly: { $sum: "$referred_user_pay_monthly" },
                    referred_user_pay_overall: { $sum: "$referred_user_pay_overall" },
                }
            }
        ]);
        console.log({
            totaluserIncome: totaluserIncome.length > 0 ? totaluserIncome[0] : {}
        });


        // const AdminPaidAmount = await AdminPayment.aggregate([
        //     {
        //         $group: {
        //             _id: "$paymentType",
        //             totalAmount: { $sum: "$amount" }
        //         }
        //     }
        // ]);

        const totalAmount = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const todayIncome = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: today, $lt: tomorrow },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const yesterdayIncome = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: yesterday, $lt: today },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const weekIncome = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: startOfWeek, $lte: tomorrow },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const monthIncome = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: startOfMonth, $lte: tomorrow },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        // const pendingCoursesCount = await Course.countDocuments({});

        res.status(200).json({
            success: true,
            registered: registeredCount,
            active: activeCount,
            inactive: inactiveCount,
            enrolled: enrolledCount,
            totalusercount: totalusercount,
            totaluserIncome: totaluserIncome.length > 0 ? totaluserIncome[0] : {},
            totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
            todayIncome: todayIncome.length > 0 ? todayIncome[0].total : 0,
            yesterdayIncome: yesterdayIncome.length > 0 ? yesterdayIncome[0].total : 0,
            thisWeekIncome: weekIncome.length > 0 ? weekIncome[0].total : 0,
            thisMonthIncome: monthIncome.length > 0 ? monthIncome[0].total : 0,
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});