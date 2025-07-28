const catchAsync = require("../utill/catchAsync");
const Profile = require("../Model/Profile");
const User = require("../Model/User");
const SocialSection = require("../Model/Social");
const Refral = require("../Model/Referal");
const Bank = require("../Model/Bank");
const logger = require("../utill/Loggers");
const Payment = require("../Model/Payment");
const AdminPay = require("../Model/Adminpay");
const mongoose = require('mongoose');
const Transaction = require("../Model/Transcation");
const Review = require("../Model/Review");
const moment = require("moment-timezone");



const getReferralEarnings = require("../utill/getReferralEarnings");



exports.profileAddOrUpdate = catchAsync(async (req, res) => {
    const userId = req?.User?._id; // Assuming `User` is attached to the request object
    const {
        firstname,
        address,
        policy,
        bsemail,
        term,
        lastname,
        username,
        profileImage,
        phone_number,
        designation,
        bio,
    } = req.body;
    try {


        const existingProfile = await Profile.findOne({ userId });
        if (existingProfile) {
            existingProfile.firstname = firstname || existingProfile.firstname;
            existingProfile.lastname = lastname || existingProfile.lastname;
            existingProfile.phone_number = phone_number || existingProfile.phone_number;
            existingProfile.designation = designation || existingProfile.designation;
            existingProfile.bio = bio || existingProfile.bio;
            existingProfile.address = address || existingProfile.address;
            existingProfile.policy = policy || existingProfile.policy;
            existingProfile.term = term || existingProfile.term;
            existingProfile.profileImage = profileImage || existingProfile.profileImage;
            existingProfile.bsemail = bsemail || existingProfile.bsemail;
            const updatedProfile = await existingProfile.save();
            const recorddata = await User.findByIdAndUpdate(userId, {
                name: `${firstname} ${lastname}`.trim(),
            });
            res.json({
                status: true,
                message: "Profile has been successfully updated!",
                data: updatedProfile,
                record: recorddata
            });
        } else {
            const newProfile = new Profile({
                phone_number,
                designation,
                bio,
                profileImage,
                userId,
                address,
                bsemail,
                policy,
                term
            });
            const savedProfile = await newProfile.save();
            const record = await User.findByIdAndUpdate(userId, {
                name: `${firstname}${lastname}`.trim(),
            });
            res.json({
                status: true,
                message: "Profile has been successfully created!",
                data: savedProfile,
                record: record
            });
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            status: false,
            message: "An error occurred while processing the profile.",
            error: error.message,
        });
    }
});


exports.ProfileData = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.body?.id;
        const now = moment().tz("Asia/Kolkata");
        const todayStart = now.clone().startOf("day").utc().toDate();
        const todayEnd = now.clone().endOf("day").utc().toDate();
        const weekStart = now.clone().startOf("week").utc().toDate();
        const weekEnd = now.clone().endOf("week").utc().toDate();
        const monthStart = now.clone().startOf("month").utc().toDate();
        const monthEnd = now.clone().endOf("month").utc().toDate();

        const referralQuery = {
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId },
            ],
        };

        const referredUsers = await User.find(referralQuery)
            .select("-password -OTP")
            .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
            .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_second", model: "User", select: "name email referral_code" });

        const referralUserIds = referredUsers.map(user => user._id);

        console.log("Referral User IDs:", referralUserIds);

        const paymentFilter = {
            UserId: { $in: referralUserIds },
            payment_status: "success",
        };

        const paymentss = await Payment.find(paymentFilter).lean();

        console.log("Payment Data:", paymentss);

        // Group payments by time ranges
        const earnings = {
            today: [],
            week: [],
            month: [],
            overall: paymentss, // All valid payments
        };

        paymentss.forEach(payment => {
            const payDate = new Date(payment.paymentDate);
            if (payDate >= todayStart && payDate <= todayEnd) {
                earnings.today.push(payment);
            }
            if (payDate >= weekStart && payDate <= weekEnd) {
                earnings.week.push(payment);
            }
            if (payDate >= monthStart && payDate <= monthEnd) {
                earnings.month.push(payment);
            }
        });

        // Optionally calculate total amount per time period
        const calculateTotal = (arr, userId) =>
            arr.reduce((sum, p) => {
                let total = 0;
                if (p.referredData1?.userId?.toString() === userId.toString()) {
                    total += p.referredData1.payAmount || 0;
                }
                if (p.referredData2?.userId?.toString() === userId.toString()) {
                    total += p.referredData2.payAmount || 0;
                }
                if (p.referredData3?.userId?.toString() === userId.toString()) {
                    total += p.referredData3.payAmount || 0;
                }
                return sum + total;
            }, 0);


        const totals = {
            today: calculateTotal(earnings.today, userId),
            week: calculateTotal(earnings.week, userId),
            month: calculateTotal(earnings.month, userId),
            overall: calculateTotal(earnings.overall, userId),
        };



        // console.log("Referral earnings data:", earnings);
        console.log("Referral earnings data:", totals)

        const UserData = await User.findOne({ _id: userId }).select("-password").populate("CourseId");

        if (!UserData) {
            return res.status(404).json({
                status: false,
                message: "User not found."
            });
        }

        const currentMonthIdentifier = moment().format('YYYY-MM'); // e.g., "2025-07"
        const currentWeekIdentifier = moment().format('YYYY-WW');   // e.g., "2025-27" (for ISO week)
        const currentDayIdentifier = moment().format('YYYY-MM-DD'); // e.g., "2025-07-06"

        const Course = UserData;

        // Daily/Current Payment Calculation

        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');

        const ProfileData = await Profile.findOne({ userId: userId });
        const updatedSocials = await SocialSection.findOne({ userId: userId });
        const reviews = await Review.find({ userId: new mongoose.Types.ObjectId(userId) });
        const BankData = await Bank.findOne({ userId: userId });
        const payment = await Payment.findOne({ UserId: userId });
        //  total  payout 

        const payments = await AdminPay.find({
            userId: userId,
        });

        let totalPaymentWithdrawal = 0;
        let totalPayoutPayment = 0;
        let totalAdd = 0;

        payments.forEach(payment => {
            totalPaymentWithdrawal += payment.paymentWidthrawal || 0;
            totalPayoutPayment += payment.payoutpayment || 0;
            totalAdd += payment.payment_Add || 0;
        });


        // one Day  Payment Calculation

        const datapayment = ((totalAdd) - (totalPayoutPayment) - (totalPaymentWithdrawal) + (totals?.overall || 0));


        const AdminPayments = await AdminPay.find({ userId: userId });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        //weekly Admin paymnet 
        const paymentweeklys = await AdminPay.find({
            userId: userId,
            payment_date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
        });

        let totalweekPaymentWithdrawal = 0;
        let totalweekPayoutPayment = 0;
        let totalweekAddPayment = 0
        paymentweeklys.forEach(payment => {
            totalweekPaymentWithdrawal += payment.paymentWidthrawal || 0;
            totalweekPayoutPayment += payment.payoutpayment || 0;
            totalweekAddPayment += payment.payment_Add || 0;
        });
        //monthlu payment 


        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');

        const paymentMonthlys = await AdminPay.find({
            userId: userId,
            payment_date: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
        });

        let totalMonthPaymentWithdrawal = 0;
        let totalMonthPayoutPayment = 0;
        let totalMonthAddPayment = 0;

        paymentMonthlys.forEach(payment => {
            totalMonthPaymentWithdrawal += payment.paymentWidthrawal || 0;
            totalMonthPayoutPayment += payment.payoutpayment || 0;
            totalMonthAddPayment += payment.payment_Add || 0;
        });


        const Transactions = await Transaction.find({ user: userId });

        const referralData = await User.find({
            $or: [
                { referred_by: UserData?.referred_by }, // Check if current user was referred by this user
                { referred_first: userId }, // Check if this user is the first referrer
                { referred_second: userId } // Check if this user is the second referrer
            ]
        }).populate({
            path: "CourseId",
            select: "title discountPrice category courseImage"
        });

        // Weekly Payment Calculation
        let WeekPayment = 0;
        if (Course?.lastPaymentWeek === currentWeekIdentifier) {
            WeekPayment = (Course?.UnPaidAmounts === 0
                ? ((totalweekAddPayment) - (totalweekPaymentWithdrawal))
                : ((totals?.week) - (Course?.lastTodayIncome || 0) + (Course?.UnPaidAmounts || 0) + (totalweekAddPayment) - (totalweekPaymentWithdrawal))
            )
        }
        let MonthPayment = 0;
        if (Course?.lastPaymentMonth === currentMonthIdentifier) {
            MonthPayment = ((totals?.month) - (totalMonthPaymentWithdrawal || 0) + (totalMonthAddPayment || 0) + (Course?.first_user_pay || 0) + (Course?.second_user_pay || 0) + (Course?.referred_user_pay || 0));
        }

        const OverAllPayment =  ((totals?.overall) - (Course?.lastTodayIncome || 0) + (Course?.UnPaidAmounts || 0) + (totalAdd) -(totalPaymentWithdrawal))

            console.log("OverAllPayment" , OverAllPayment)

        return res.status(200).json({
            status: true,
            user: UserData,
            profile: ProfileData,
            social: updatedSocials,
            BankData: BankData,
            data: referralData,
            payment: payment,
            Transactions: Transactions,
            AdminPayments: AdminPayments,
            review: reviews,
            datapayment: datapayment,
            WeekPayment: WeekPayment,
            MonthPayment: MonthPayment,
            OverAllPayment: OverAllPayment,
            message: "User profile data retrieved successfully.",
        });
    } catch (error) {
        console.error("❌ Error in ProfileData:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching user profile data.",
            error: error.message || "Internal Server Error",
        });
    }
});

// ProfileAdminPayeData Controller Function
exports.ProfileAdminPayeData = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.query?.id;
        const { page = 1, limit = 10, payment_date } = req.query;
        const query = { userId: userId };

        if (payment_date) {
            const startOfDayIST = moment.tz(payment_date, "Asia/Kolkata").startOf("day");
            const endOfDayIST = moment.tz(payment_date, "Asia/Kolkata").endOf("day");

            const startUTC = startOfDayIST.clone().utc().toDate();
            const endUTC = endOfDayIST.clone().utc().toDate();

            query.payment_date = { $gte: startUTC, $lte: endUTC };
        }

        const AdminPayments = await AdminPay.find(query)
            .sort({ payment_date: -1 })
            .skip((page - 1) * limit)
            .limit((limit));
        const totalPayments = await AdminPay.countDocuments(query);

        return res.status(200).json({
            status: true,
            AdminPayments: AdminPayments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPayments / limit),
            totalPayments,
            message: "Users retrieved successfully with payment data filtered by date",
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching payment data.",
            error: error.message || "Internal Server Error",
        });
    }
});

// Example query: 
// GET /api/payments?page=1&limit=10&startDate=2024-01-01

exports.ProfileDataId = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.User?._id;
        const UserData = await User.findOne({ _id: userId }); // Convert to plain object
        const ProfileData = await Profile.findOne({ userId: userId });
        const updatedSocials = await SocialSection.findOne({ userId: userId });
        const BankData = await Bank.findOne({ userId: userId });
        const RefralCode = await Refral.findOne({ userId: userId });

        const user = await User.findById(userId);
        let referralQuery = {
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId },
            ],
        };

        const totalReferrals = await User.countDocuments(referralQuery);

        return res.status(200).json({
            status: true,
            user: UserData,
            profile: ProfileData,
            social: updatedSocials,
            totalReferral: totalReferrals,
            Bank: BankData,
            RefralCode: RefralCode,
            message: "Users retrieved successfully with enquiry counts updated",
        });
    } catch (error) {
        logger.error(error)
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching users and updating enquiry counts.",
            error: error.message || "Internal Server Error", // Provide a fallback error message
        });
    }
});