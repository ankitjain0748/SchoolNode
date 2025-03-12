const User = require("../Model/User");
const AdminPayment = require("../Model/Adminpay");
const catchAsync = require("../utill/catchAsync");
const Payment = require("../Model/Payment");
const moment = require("moment");

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
        const startOfDay = moment().startOf('day').toDate();
        const startOfWeeks = moment().startOf('week').toDate();
        const startOfMonths = moment().startOf('month').toDate();
        const previousDate = moment().subtract(1, 'days').toDate()
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
        const AdminPaidAmount = await AdminPayment.aggregate([
            {
                $group: {
                    _id: "$paymentType",
                    totalAmount: { $sum: "$payment_key" },
                    previousDay: {
                        $sum: {
                            $cond: [{ $gte: ["$payment_date", previousDate] }, "$payment_key", 0]
                        }
                    },
                    today: {
                        $sum: {
                            $cond: [{ $gte: ["$payment_date", startOfDay] }, "$payment_key", 0]
                        }
                    },
                    weekly: {
                        $sum: {
                            $cond: [{ $gte: ["$payment_date", startOfWeeks] }, "$payment_key", 0]
                        }
                    },
                    monthly: {
                        $sum: {
                            $cond: [{ $gte: ["$payment_date", startOfMonths] }, "$payment_key", 0]
                        }
                    },
                    overall: { $sum: "$payment_key" }  // Total sum
                }
            }
        ]);
        const totalAmount = await Payment.aggregate([
            {
                $match: { payment_status: "success" } 
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }, // Sirf successful payments ka sum karega
                }
            }
        ]);
        const totalPaymentAddAmount = await AdminPayment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$payment_Add" },
                },
            },
        ]);
        const totalGSTAmount = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalGSTAmount: { $sum: "$GST_Number" } // Summing up all GST_Number values
                }
            }
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
        res.status(200).json({
            success: true,
            registered: registeredCount,
            active: activeCount,
            inactive: inactiveCount,
            enrolled: enrolledCount,
            totalusercount: totalusercount,
            AdminPaidAmount: AdminPaidAmount,
            totalPaymentAddAmount: totalPaymentAddAmount.length > 0 ? totalPaymentAddAmount[0].total :0,
            totalGSTAmount: totalGSTAmount.length > 0 ? totalGSTAmount[0].totalGSTAmount :0,
            totaluserIncome: totaluserIncome.length > 0 ? totaluserIncome[0] :0,
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