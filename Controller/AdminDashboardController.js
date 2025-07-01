const User = require("../Model/User");
const AdminPayment = require("../Model/Adminpay");
const catchAsync = require("../utill/catchAsync");
const Payment = require("../Model/Payment");
const moment = require("moment");
const bcrypt = require("bcrypt");
const SocialSection = require("../Model/Social");
const ProfileData = require("../Model/Profile");
const Loggers = require("../utill/Loggers");
const jwt = require("jsonwebtoken");

const signToken = async (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "14400m",
    });
    return token;
};

// Helper function to generate $sum fields
function sumFields(fields) {
    return fields.reduce((acc, field) => {
        acc[field] = { $sum: `$${field}` };
        return acc || 0;
    }, {});
}


exports.AdminDashboard = catchAsync(async (req, res) => {
    try {
        const userId = req.User._id;
        const [registeredCount, activeCount, inactiveCount, enrolledCount, totalusercount, user, profileData] = await Promise.all([
            User.countDocuments({ user_status: "registered", role: "user" }),
            User.countDocuments({ user_status: "active", role: "user" }),
            User.countDocuments({ user_status: "inactive", role: "user" }),
            User.countDocuments({ user_status: "enrolled", role: "user" }),
            User.countDocuments({}),
            User.findById(userId),
            ProfileData.findOne({ userId })
        ]);

        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'day');
        const yesterday = moment(today).subtract(1, 'day');
        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const startOfMonth = moment(today).startOf('month');
        const startOfNextMonth = moment(startOfMonth).add(1, 'month');
        const startOfToday = moment().startOf('day');
        const endOfToday = moment().endOf('day');
        const endOfNextMonth = moment(startOfNextMonth).endOf('month');

        // 1. Today Payments
        const adminPaymentsToday = await AdminPayment.aggregate([
            {
                $match: {
                    payment_date: {
                        $gte: startOfToday.toDate(),
                        $lte: endOfToday.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },


                }
            }
        ]);

        // 2. This Week Payments
        const adminPaymentsWeek = await AdminPayment.aggregate([
            {
                $match: {
                    payment_date: {
                        $gte: startOfWeek.toDate(),
                        $lte: endOfWeek.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },
                }
            }
        ]);

        // 3. This Month Payments
        const adminPaymentsMonth = await AdminPayment.aggregate([
            {
                $match: {
                    payment_date: {
                        $gte: startOfMonth.toDate(),
                        $lte: endOfNextMonth.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },
                }
            }
        ]);

        // 4. Overall Payments (no match needed)
        const overallAdminPayments = await AdminPayment.aggregate([
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },
                }
            }
        ]);

        // Now handle safely
        const todayData = adminPaymentsToday[0] || { totalAdd: 0, totalWithdrawal: 0, totalPayout: 0 };
        const weekData = adminPaymentsWeek[0] || { totalAdd: 0, totalWithdrawal: 0, totalPayout: 0 };
        const monthData = adminPaymentsMonth[0] || { totalAdd: 0, totalWithdrawal: 0, totalPayout: 0 };
        const overallData = overallAdminPayments[0] || { totalAdd: 0, totalWithdrawal: 0, totalPayout: 0 };

        const totaluserIncome = await User.aggregate([
            {
                $group: {
                    _id: null, ...sumFields([
                        'lastTodayIncome', 'referred_user_pay_daily', 'referred_user_pay_weekly',
                        'referred_user_pay_monthly', 'referred_user_pay_overall', 'passive_income',
                        'first_user_pay', 'second_user_pay', 'referred_user_pay',
                        'InActivePercentageamount', 'UnPaidAmounts', 'totalPayout',
                        'totalWidthrawal', 'totalAdd', 'TodayPayment', "paymentmanage"
                    ])
                }
            }
        ]);

        const paymentToday = await Payment.aggregate([
            { $match: { payment_date: { $gte: today.toDate(), $lt: tomorrow.toDate() }, payment_status: "success" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const paymentYesterday = await Payment.aggregate([
            { $match: { payment_date: { $gte: yesterday.toDate(), $lt: today.toDate() }, payment_status: "success" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);


        // 🔹 Total unpaid for the same week
        const userunpaidweek = await User.aggregate([
            {
                $match: {
                    lastPaymentWeek: lastPaymentWeek
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ["$UnPaidAmounts", 0] } }
                }
            }
        ]);

        const totalUnpaid = userunpaidweek[0]?.total || 0;

        // 🔹 Total unpaid for the same month
        const userunpaidMonth = await User.aggregate([
            {
                $match: {
                    lastPaymentMonth: lastPaymentMonth
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ["$UnPaidAmounts", 0] } }
                }
            }
        ]);
        const totalMonthUnpaid = userunpaidMonth[0]?.total || 0;
        const paymentThisWeek = await Payment.aggregate([
            { $match: { payment_date: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() }, payment_status: "success" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const paymentThisMonth = await Payment.aggregate([
            { $match: { payment_date: { $gte: startOfMonth.toDate(), $lt: startOfNextMonth.toDate() }, payment_status: "success" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const AdminPaidAmount = await AdminPayment.aggregate([
            { $group: { _id: "$paymentType", totalAmount: { $sum: "$payment_key" } } }
        ]);

        const paymentOverall = await Payment.aggregate([
            {
                $match: {
                    payment_status: "success"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);


        const NextPayoutPayments = await User.aggregate([
            { $match: { lastPaymentDay: today.format('YYYY-MM-DD') } },
            { $group: { _id: null, total: { $sum: { $add: ["$referred_user_pay", "$first_user_pay", "$second_user_pay"] } } } }
        ]);

        const overallPassiveIncome = await User.aggregate([
            { $group: { _id: null, first_user_pay: { $sum: "$first_user_pay" }, second_user_pay: { $sum: "$second_user_pay" }, pervious_passive_income_month: { $sum: "$pervious_passive_income_month" } } }
        ]);

        const totalGSTAmount = await Payment.aggregate([
            { $group: { _id: null, totalGSTAmount: { $sum: "$GST_Number" } } }
        ]);

        const result = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: today.toDate(), $lt: tomorrow.toDate() },
                    payment_status: "success"
                }
            },
            {
                $project: {
                    data: [
                        {
                            userId: "$referredData2.userId",
                            payAmount: "$referredData2.payAmount"
                        },
                        {
                            userId: "$referredData3.userId",
                            payAmount: "$referredData3.payAmount"
                        },
                        {
                            userId: "$referredData1.userId",
                            payAmount: "$referredData1.payAmount"
                        }
                    ]
                }
            },
            { $unwind: "$data" },
            { $match: { "data.userId": { $ne: null } } },
            {
                $group: {
                    _id: "$data.userId",
                    totalPayAmount: { $sum: "$data.payAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    totalPayAmount: 1
                }
            }
        ]);
        const finalResult = result.length > 0 ? result : [{ userId: null, totalPayAmount: 0 }];

        let totalSum = 0;

        for (const item of finalResult) {
            totalSum += item.totalPayAmount;
        }



        const resultMonthly = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: startOfNextMonth.toDate(), $lte: endOfNextMonth.toDate() },
                    payment_status: "success"
                }
            },
            {
                $project: {
                    data: [
                        { userId: "$referredData3.userId", payAmount: "$referredData3.payAmount" },
                        { userId: "$referredData1.userId", payAmount: "$referredData1.payAmount" }
                    ]
                }
            },
            { $unwind: "$data" },
            { $match: { "data.userId": { $ne: null } } },
            {
                $group: {
                    _id: "$data.userId",
                    totalPayAmount: { $sum: "$data.payAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    totalPayAmount: 1
                }
            }
        ]);

        const finalMonthResults = resultMonthly.length > 0 ? resultMonthly : [{ userId: null, totalPayAmount: 0 }];

        let totalSumMonthpassive = 0;
        for (const item of finalMonthResults) {
            totalSumMonthpassive += item.totalPayAmount;
        }



        const resultweekly = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: startOfWeek.toDate(), $lte: endOfToday.toDate() },
                    payment_status: "success"
                }
            },
            {
                $project: {
                    data: [
                        { userId: "$referredData3.userId", payAmount: "$referredData3.payAmount" },
                        { userId: "$referredData1.userId", payAmount: "$referredData1.payAmount" }
                    ]
                }
            },
            { $unwind: "$data" },
            { $match: { "data.userId": { $ne: null } } },
            {
                $group: {
                    _id: "$data.userId",
                    totalPayAmount: { $sum: "$data.payAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    totalPayAmount: 1
                }
            }
        ]);

        const finalResults = resultweekly.length > 0 ? resultweekly : [{ userId: null, totalPayAmount: 0 }];

        let totalSumWeekly = 0;
        for (const item of finalResults) {
            totalSumWeekly += item.totalPayAmount;
        }


        const userMonthly = await User.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: startOfMonth.toDate(),
                        $lt: endOfNextMonth.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $ifNull: ["$referred_user_pay_monthly", 0] } }
                }
            }
        ]);

        const totalMonthrefral = userMonthly[0]?.total || 0;

        res.status(200).json({
            success: true,
            totalSumWeekly: totalSumWeekly || 0,
            user,
            todayData,
            weekData,
            monthData,
            overallData,
            profileData,
            registered: registeredCount,
            active: activeCount,
            inactive: inactiveCount,
            enrolled: enrolledCount,
            totalusercount,
            AdminPaidAmount,
            totalGSTAmount: totalGSTAmount[0]?.totalGSTAmount || 0,
            totaluserIncome: totaluserIncome[0] || {},
            todayIncome: paymentToday[0]?.total || 0,
            yesterdayIncome: paymentYesterday[0]?.total || 0,
            thisWeekIncome: paymentThisWeek[0]?.total || 0,
            thisMonthIncome: paymentThisMonth[0]?.total || 0,
            overallIncome: paymentOverall[0]?.total || 0,
            NextPayoutPayments: NextPayoutPayments[0]?.total || 0,
            overallPassiveIncome: overallPassiveIncome[0] || {},
            totalSum: totalSum || 0,
            totalUnpaid: totalUnpaid,
            totalMonthUnpaid: totalMonthUnpaid,
            totalSumMonthpassive: totalSumMonthpassive || 0,
            totalMonthrefral: totalMonthrefral || 0
        });

    } catch (error) {
        console.error("AdminDashboard Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



exports.adminlogin = catchAsync(async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(401).json({
                status: false,
                message: "Email and password are required!",
            });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid Email or password",
            });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: "Incorrect password. Please try again.",
            });
        }

        if (user.role !== role) {
            return res.status(403).json({
                status: false,
                message: "Access denied. Only admins can log in.",
            });
        }

        // Generate a token for the user
        const token = await signToken(user._id);
        res.json({
            status: true,
            message: "Login Successfully!",
            token,
        });
    } catch (error) {
        console.log("error", error)
        Loggers.error("Error fetching booking:", error);
        return res.status(500).json({
            error,
            message: "An unknown error occurred. Please try later.",
        });
    }
});

exports.profileadmin = catchAsync(async (req, res, next) => {
    try {
        const adminUser = await User.findOne({ role: "admin", isDeleted: false }).select("-password");
        const SocialAdmin = await SocialSection.findOne({ userId: adminUser?._id });
        const ProfileAdmin = await ProfileData.findOne({ userId: adminUser?._id });

        if (!adminUser) {
            return res.status(404).json({
                status: false,
                message: "Admin user not found.",
            });
        }
        const users = await User.find({ role: "user", user_status: { $ne: "registered" }, isDeleted: false });



        const userCount = await User.countDocuments();
        let activeCount = 0;
        let inactiveCount = 0;
        for (const user of users) {
            const {
                referred_user_pay_monthly,
                referred_user_pay,
                UnPaidAmounts,
                pervious_passive_income_month,
                totalWidthrawal
            } = user;
            const totalPayment = (referred_user_pay_monthly || 0) + (referred_user_pay || 0) - (UnPaidAmounts) - (totalWidthrawal ? totalWidthrawal : 0) || 0;
            const userStatus =
                Number(totalPayment) >= Number(adminUser?.ActiveUserPrice)
                    ? 'active'
                    : 'inactive';

            // const userStatus = adminUser?.ActiveUserPrice >= totalPayment ? 'inactive' : 'active';
            const percentageValue = (pervious_passive_income_month * (adminUser?.InActiveUserPercanetage || 0)) / 100;
            const validPercentageValue = isNaN(percentageValue) ? 0 : percentageValue;
            const incFields = {
                passive_income: validPercentageValue
            };

            if (userStatus === 'inactive') {
                incFields.InActivePercanetageAmount = validPercentageValue; // 30% amount added
            }

            await User.findByIdAndUpdate(
                user._id,
                {
                    $set: { user_status: userStatus },
                    $inc: incFields
                },
                { new: true }
            );
            // Update counters
            if (userStatus === 'active') {
                activeCount++;
            } else {
                inactiveCount++;
            }
        }

        res.status(200).json({
            status: true,
            message: "Users retrieved and updated successfully with enquiry counts updated",
            data: {
                adminUser,
                userCount,
                activeCount,
                inactiveCount,
            },
            ProfileAdmin: ProfileAdmin,
            SocialAdmin: SocialAdmin
        });
    } catch (error) {
        Loggers.error("Error fetching users:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching and updating users.",
            error: error.message || "Internal Server Error",
        });
    }
});

