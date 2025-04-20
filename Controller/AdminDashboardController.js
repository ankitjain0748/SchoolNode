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

exports.AdminDashboard = catchAsync(async (req, res) => {
    try {

        const registeredCount = await User.countDocuments({ user_status: "registered", role: "user" });
        const activeCount = await User.countDocuments({ user_status: "active", role: "user" });
        const inactiveCount = await User.countDocuments({ user_status: "inactive", role: "user" });
        const enrolledCount = await User.countDocuments({ user_status: "enrolled", role: "user" });
        const totalusercount = await User.countDocuments({});
        const userId = req.User._id;
        const user = await User.findById(userId);
        const profileData = await ProfileData.findOne({ userId });
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
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

//Next Payout
        const todays = new Date();
        todays.setHours(0, 0, 0, 0);
        const tomorrows = new Date(todays);
        tomorrows.setDate(today.getDate());
        const yyyy = tomorrows.getFullYear();
        const mm = String(tomorrows.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrows.getDate()).padStart(2, '0');
        const tomorrowDateString = `${yyyy}-${mm}-${dd}`;
     


        const totaluserIncome = await User.aggregate([
            {
                $group: {
                    _id: null,
                    lastTodayIncome: { $sum: "$lastTodayIncome" },
                    referred_user_pay_daily: { $sum: "$referred_user_pay_daily" },
                    referred_user_pay_weekly: { $sum: "$referred_user_pay_weekly" },
                    referred_user_pay_monthly: { $sum: "$referred_user_pay_monthly" },
                    referred_user_pay_overall: { $sum: "$referred_user_pay_overall" },
                    passive_income: { $sum: "$passive_income" },
                    totalFirst: { $sum: "$first_user_pay" },
                    totalSecond: { $sum: "$second_user_pay" },
                    totalDirect: { $sum: "$referred_user_pay" },
                    InActivePercentageamount: { $sum: "$InActivePercentageamount" },
                    UnPaidAmounts: { $sum: "$UnPaidAmounts" },
                    totalPayout: { $sum: "$totalPayout" },
                    totalWidthrawal: { $sum: "$totalWidthrawal" },
                    totalAdd: { $sum: "$totalAdd" }
                }
            }
        ]);


        const result = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: today, $lt: tomorrow },
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
        // 1. Today's payments
        const todayAdminPayments = await AdminPayment.aggregate([
            {
                $match: {
                    payment_date: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAdd: 1,
                    totalWithdrawal: 1,
                    totalPayout: 1
                }
            }
        ]);

        // ✅ If no data found, set default values
        const payments = todayAdminPayments[0] || {
            totalAdd: 0,
            totalWithdrawal: 0,
            totalPayout: 0
        };


            // weekly overall income :- 
            const weeklyAdminPayments = await AdminPayment.aggregate([
                {
                    $match: {
                        payment_date: { $gte: startOfWeek, $lt: endOfWeek }
    
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAdd: { $sum: "$payment_Add" },
                        totalWithdrawal: { $sum: "$paymentWidthrawal" },
                        totalPayout: { $sum: "$payoutpayment" },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalAdd: 1,
                        totalWithdrawal: 1,
                        totalPayout: 1
                    }
                }
            ]);
    
            // Monthly overall income :- 
            const MonthlyAdminPayments = await AdminPayment.aggregate([
                {
                    $match: {
                        payment_date: { $gte: startOfMonth, $lt: startOfNextMonth }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAdd: { $sum: "$payment_Add" },
                        totalWithdrawal: { $sum: "$paymentWidthrawal" },
                        totalPayout: { $sum: "$payoutpayment" },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalAdd: 1,
                        totalWithdrawal: 1,
                        totalPayout: 1
                    }
                }
            ]);
        // 2. Overall payments
        const overallAdminPayments = await AdminPayment.aggregate([
            {
                $group: {
                    _id: null,
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: { $sum: "$paymentWidthrawal" },
                    totalPayout: { $sum: "$payoutpayment" },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAdd: 1,
                    totalWithdrawal: 1,
                    totalPayout: 1,
                }
            }
        ]);

        const overallPassiveIncome = await User.aggregate([
            {
                $group: {
                    _id: null,
                    pervious_passive_income_month: { $sum: "$pervious_passive_income_month" },
                    first_user_pay: { $sum: "$first_user_pay" },
                    second_user_pay: { $sum: "$second_user_pay" },
                }
            },
            {
                $project: {
                    _id: 0,
                    first_user_pay: 1,
                    second_user_pay: 1,
                    pervious_passive_income_month: 1,
                }
            }
        ]);
      

        const NextPayoutPayments = await User.aggregate([
            {
                $match: {
                    lastPaymentDay: tomorrowDateString // You probably meant a range here
                }
            },
            {
                $group: {
                    _id: null,
                    totalReferred: { $sum: "$referred_user_pay" },
                    totalFirst: { $sum: "$first_user_pay" },
                    totalSecond: { $sum: "$second_user_pay" }

                }
            },
            {
                $project: {
                    _id: 0,
                    total: {
                        $add: ["$totalReferred", "$totalFirst", "$totalSecond"]
                    }
                }
            }
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
                    payment_status: "success" // ✅ Only successful payments
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        let totalTodayIncome = 0; // Default value if no data

        if (todayIncome.length > 0) {
            totalTodayIncome = todayIncome[0]?.total || 0;
        }


        const yesterdayIncome = await Payment.aggregate([
            {
                $match: {
                    payment_date: { $gte: yesterday, $lt: today },
                    payment_status: "success" // ✅ Only successful payments

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
                    payment_status: "success" // ✅ Only successful payments

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
                    payment_status: "success" // ✅ Only successful payments

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
            user: user,
            profileData: profileData,
            registered: registeredCount,
            active: activeCount,
            inactive: inactiveCount,
            enrolled: enrolledCount,
            totalusercount: totalusercount,
            AdminPaidAmount: AdminPaidAmount,
            totalPaymentAddAmount: totalPaymentAddAmount[0]?.total,
            totalGSTAmount: totalGSTAmount[0]?.totalGSTAmount,
            totaluserIncome: totaluserIncome[0],
            totalAmount: totalAmount[0],
            todayIncome: totalTodayIncome,
            yesterdayIncome: yesterdayIncome[0]?.total,
            thisWeekIncome: weekIncome[0]?.total,
            thisMonthIncome: monthIncome[0]?.total,
            todayAdminPayments: payments,
            overallAdminPayments: overallAdminPayments[0],
            MonthlyAdminPayments: MonthlyAdminPayments[0],
            weeklyAdminPayments: weeklyAdminPayments[0],
            overallPassiveIncome: overallPassiveIncome[0],
            NextPayoutPayments: NextPayoutPayments[0],
            UserPayout: totalSum,
        });
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

exports.adminlogin = catchAsync(async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Check if email and password are provided
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
            const userStatus = totalPayment >= adminUser?.ActiveUserPrice ? 'active' : 'inactive';
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

