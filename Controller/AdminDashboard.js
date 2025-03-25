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
const sendEmail = require("../utill/Emailer");

const signToken = async (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "14400m",
    });
    return token;
};

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
        const registeredCount = await User.countDocuments({ user_status: "registered" , role: "user" });
        const activeCount = await User.countDocuments({ user_status: "active"  , role: "user" });
        const inactiveCount = await User.countDocuments({ user_status: "inactive" , role: "user" });
        const enrolledCount = await User.countDocuments({ user_status: "enrolled" , role: "user" });
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
            totalPaymentAddAmount: totalPaymentAddAmount.length > 0 ? totalPaymentAddAmount[0].total : 0,
            totalGSTAmount: totalGSTAmount.length > 0 ? totalGSTAmount[0].totalGSTAmount : 0,
            totaluserIncome: totaluserIncome.length > 0 ? totaluserIncome[0] : 0,
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
            const { referred_user_pay, second_user_pay, first_user_pay } = user;
            const totalPayment = referred_user_pay || 0;
            const userStatus = adminUser?.ActiveUserPrice >= totalPayment ? 'inactive' : 'active';
            const percentageValue = (((second_user_pay || 0) + (first_user_pay || 0)) * (adminUser?.InActiveUserPercanetage || 0)) / 100;
            const validPercentageValue = isNaN(percentageValue) ? 0 : percentageValue;

            await User.findByIdAndUpdate(
                user._id,
                {
                    $set: { user_status: userStatus },
                    $inc: { passive_income: validPercentageValue },
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

exports.paymentdata = catchAsync(async (req, res) => {
    try {
      const {
        Id, data_payment, success_reasons, payment_type, paymentMethod,
        payment_reason, transactionId, payment_data, payment_income,
        referred_user_pay, payment_key, page, withdrawal_reason,
        paymentWidthrawal, payment_Add
      } = req.body;
  
      if (!Id) {
        return res.status(400).json({
          status: false,
          message: "User ID is required."
        });
      }
  
      const currentDate = moment();
      const currentMonth = currentDate.format('YYYY-MM');
      const currentWeek = currentDate.format('YYYY-WW');
      const currentDay = currentDate.format('YYYY-MM-DD');
  
      const user = await User.findById(Id);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found!"
        });
      }
  
      // Initialize or reset values
      let updatedReferredUserPayOverall = user.referred_user_pay_overall || 0;
      let updatedReferredUserPayMonthly = user.referred_user_pay_monthly || 0;
      let updatedReferredUserPayWeekly = user.referred_user_pay_weekly || 0;
      let updatedReferredUserPayDaily = user.referred_user_pay_daily || 0;
      let updatedPaymentKey = user.payment_key_daily || 0;
      let updatedLastTodayIncome = user.lastTodayIncome - payment_key || 0;
  
      // Reset values when period changes
      if (user.lastPaymentMonth !== currentMonth) updatedReferredUserPayMonthly = 0;
      if (user.lastPaymentWeek !== currentWeek) updatedReferredUserPayWeekly = 0;
  
      if (user.lastPaymentDay !== currentDay) {
        updatedLastTodayIncome = updatedReferredUserPayDaily; // Save today's income to lastTodayIncome
        updatedReferredUserPayDaily = 0;
        updatedPaymentKey = 0;
      }
  
      // Add current payments
      const referralAmount = Number(payment_Add) || 0;
      updatedReferredUserPayOverall += referralAmount;
      updatedReferredUserPayMonthly += referralAmount;
      updatedReferredUserPayWeekly += referralAmount;
      updatedReferredUserPayDaily += referralAmount;
      updatedPaymentKey += Number(paymentWidthrawal) || 0;
  
      const newPayment = new AdminPayment({
        userId: Id, paymentMethod, payment_type, success_reasons,
        paymentWidthrawal, payment_reason, withdrawal_reason, payment_key,
        transactionId, payment_data, payment_income, data_payment, page,
        referred_user_pay, payment_Add
      });
  
      const paymentRecord = await newPayment.save();
      if (!paymentRecord) {
        return res.status(400).json({
          status: false,
          message: "Failed to save payment data."
        });
      }
  
      // Update user payment data
      const updatedUser = await User.findByIdAndUpdate(
        Id,
        {
          payment_Add, payment_data, referred_user_pay,
          referred_user_pay_overall: updatedReferredUserPayOverall,
          referred_user_pay_monthly: updatedReferredUserPayMonthly,
          referred_user_pay_weekly: updatedReferredUserPayWeekly,
          referred_user_pay_daily: updatedReferredUserPayDaily,
          lastTodayIncome: updatedLastTodayIncome,
          lastPaymentMonth: currentMonth,
          lastPaymentWeek: currentWeek,
          payment_key: payment_key,
          lastPaymentDay: currentDay,
          payment_key_daily: updatedPaymentKey,
        },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({
          status: false,
          message: "User not found for update!"
        });
      }
  
      res.status(200).json({
        status: true,
        message: "Payment data saved and user updated successfully.",
        paymentRecord,
        updatedUser
      });
  
      // Send email notification on successful payout
      if (page === "payout") {
        const subject1 = "🎉 Your Payout Has Been Successfully Received!";
        await sendEmail({
          email: updatedUser.email,
          name: updatedUser.name,
          Webniarrecord: paymentRecord,
          subject: subject1,
          emailTemplate: Payout,
        });
      }
    } catch (error) {
      console.error("Error saving payment data and updating user:", error);
      res.status(500).json({
        status: false,
        message: "An error occurred while processing the payment. Please try again later.",
        error: error.message
      });
    }
  });