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
        const user = req?.body?.id;
        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const UserData = await User.findOne({ _id: userId }).select("-password").populate("CourseId");
        const ProfileData = await Profile.findOne({ userId: userId });
        const updatedSocials = await SocialSection.findOne({ userId: userId });
        const reviews = await Review.find({ userId: new mongoose.Types.ObjectId(userId) });
        const BankData = await Bank.findOne({ userId: userId });
        const payment = await Payment.findOne({ UserId: userId });
        const AdminPayments = await AdminPay.find({ userId: userId });
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const payments = await AdminPay.find({
            userId: userId,
            payment_date: { $gte: startOfDay, $lte: endOfDay }
        });

        let totalPaymentWithdrawal = 0;
        let totalPayoutPayment = 0;
        payments.forEach(payment => {
            totalPaymentWithdrawal += payment.paymentWidthrawal || 0;
            totalPayoutPayment += payment.payoutpayment || 0;
        });

        const paymentweeklys = await AdminPay.find({
            userId: userId,
            payment_date: { $gte: startOfWeek.toDate(), $lte: endOfWeek.toDate() }
        });
        let totalweekPaymentWithdrawal = 0;
        let totalweekPayoutPayment = 0;
        paymentweeklys.forEach(payment => {
            totalweekPaymentWithdrawal += payment.paymentWidthrawal || 0;
            totalweekPayoutPayment += payment.payoutpayment || 0;
        });
        const Transactions = await Transaction.find({ user: user });
        const referralData = await User.find({
            $or: [
                { referred_by: UserData?.referred_by },
                { referred_first: userId },
                { referred_second: userId }
            ]
        }).populate({
            path: "CourseId",
            select: "title discountPrice category courseImage"
        })


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
            totalPaymentWithdrawal: totalPaymentWithdrawal,
            totalPayoutPayment: totalPayoutPayment,
            totalweekPaymentWithdrawal: totalweekPaymentWithdrawal,
            totalweekPayoutPayment: totalweekPayoutPayment,
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

// ProfileAdminPayeData Controller Function
exports.ProfileAdminPayeData = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.query?.id; // Extract userId from query parameters
        const { page = 1, limit = 10, payment_date } = req.query; // Pagination and payment_date query
        // Initialize the query with userId
        const query = { userId: userId };

        if (payment_date) {
            const startOfDayIST = moment.tz(payment_date, "Asia/Kolkata").startOf("day");
            const endOfDayIST = moment.tz(payment_date, "Asia/Kolkata").endOf("day");

            const startUTC = startOfDayIST.clone().utc().toDate();
            const endUTC = endOfDayIST.clone().utc().toDate();

            query.payment_date = { $gte: startUTC, $lte: endUTC };
        }

        const AdminPayments = await AdminPay.find(query)
            .sort({ payment_date: -1 }) // Sort by payment_date in descending order
            .skip((page - 1) * limit) // Apply pagination: skip documents
            .limit((limit)); // Limit documents per page
        // Count total documents matching the query
        const totalPayments = await AdminPay.countDocuments(query);

        // Return the response with pagination details
        return res.status(200).json({
            status: true,
            AdminPayments: AdminPayments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPayments / limit),
            totalPayments,
            message: "Users retrieved successfully with payment data filtered by date",
        });
    } catch (error) {
        // Log the error and return a server error response
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

// Let me know if you want me to add an end date or any other filters! 🚀
exports.ProfileDataId = catchAsync(async (req, res, next) => {
    try {
        const userId = req?.User?._id;
        const UserData = await User.findOne({ _id: userId }); // Convert to plain object
        const ProfileData = await Profile.findOne({ userId: userId });
        const updatedSocials = await SocialSection.findOne({ userId: userId });
        const BankData = await Bank.findOne({ userId: userId });
        const RefralCode = await Refral.findOne({ userId: userId });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found", status: false });
        }

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