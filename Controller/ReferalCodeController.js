const UserModel = require("../Model/User");
const RefralModel = require("../Model/Referal");
const logger = require("../utill/Loggers");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const Payment = require("../Model/Payment");
const moment = require("moment-timezone");
const AdminPay = require("../Model/Adminpay");
const mongoose = require('mongoose');

exports.RefralCodeAdd = catchAsync(async (req, res) => {
    const userId = req?.User?._id;
    try {
        const { referralCode, referred_by, referred_to } = req.body;

        // Validate input
        if (!referralCode) {
            logger.warn("All fields are required");
            return res.status(400).json({
                message: "All fields are required",
                status: false,
            });
        }

        let _id = userId
        // Update User table with referral information
        const userUpdate = await UserModel.findByIdAndUpdate(
            _id,
            {
                $set: { referral_code: referralCode },
            },
            { new: true } // Return updated document
        );

        // Save referral data to ReferralModel
        const referral = new RefralModel({
            referral_code: referralCode,
            referred_by,
            referred_to,
            userId,
        });

        const referralData = await referral.save();


        // Response back to the client
        res.json({
            message: "Referral saved and user updated successfully",
            status: true,
            data: {
                referral: referralData,
                user: userUpdate,
            },
        });
    } catch (error) {
        logger.error(error);
        console.log("Error:", error);
        res.status(500).json({
            message: "Referral add failed",
            status: false,
            error: error.message,
        });
    }
});


exports.RefralCodeGet = catchAsync(async (req, res) => {
    const userId = req.User?.id;
    let { page = 1, limit = 10, payment_date, name = "" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    if (!userId) {
        return res.status(400).json({ msg: "User ID is missing", status: false });
    }

    try {
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

        if (name) {
            referralQuery.name = { $regex: new RegExp(name, "i") };
        }

        const testReferrals = await User.find(referralQuery)
            .populate("CourseId", "title discountPrice category courseImage")
            .skip((page - 1) * limit)
            .limit(limit);

        const totalReferrals = await User.countDocuments(referralQuery);

        const referralUserIds = testReferrals.map(user => user._id);

        const paymentFilter = {
            UserId: { $in: referralUserIds },
            status: "success",
        };

        if (payment_date) {
            const startOfDayIST = moment.tz(payment_date, "Asia/Kolkata").startOf("day");
            const endOfDayIST = moment.tz(payment_date, "Asia/Kolkata").endOf("day");

            const startUTC = startOfDayIST.clone().utc().toDate();
            const endUTC = endOfDayIST.clone().utc().toDate();

            paymentFilter.payment_date = { $gte: startUTC, $lte: endUTC };
        }

        const paymentReferralData = await Payment.find(paymentFilter).lean();

        // ✅ Filter testReferrals to only include users with payments on the specified date
        let filteredReferrals = testReferrals;
        if (payment_date) {
            const paidUserIds = new Set(paymentReferralData.map(p => p.UserId.toString()));
            filteredReferrals = testReferrals.filter(user => paidUserIds.has(user._id.toString()));
        }

        const referralCodes = await RefralModel.find({
            $or: [
                { userId: { $in: filteredReferrals.map(user => user.referred_by).filter(id => id !== null) } },
                { userId: { $in: filteredReferrals.map(user => user.referred_first).filter(id => id !== null) } },
                { userId: { $in: filteredReferrals.map(user => user.referred_second).filter(id => id !== null) } },
            ],
        }).sort({ created_at: -1 });

        const referralUsersWithPayment = filteredReferrals.map(referralUser => {
            const referralCode = referralCodes.find(
                code => code.userId.toString() === referralUser.referred_by?.toString()
            );
            const paymentData = paymentReferralData.filter(
                pay => pay.UserId.toString() === referralUser._id.toString()
            );
            return {
                ...referralUser.toObject(),
                paymentDetails: paymentData.length > 0 ? paymentData : null,
                referral_code: referralCode ? referralCode.referral_code : null,
            };
        });

        const AdminUser = await User.findOne({ role: "admin" });

        const matchStage = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};

        const overallAdminPayments = await AdminPay.aggregate([
            { $match: matchStage }, // Optional match stage if userId is passed
            {
                $group: {
                    _id: "$userId",
                    totalAdd: { $sum: "$payment_Add" },
                    totalWithdrawal: {
                        $sum: {
                            $cond: [
                                { $eq: ["$page", "withdrawal"] },
                                "$paymentWidthrawal",
                                0
                            ]
                        }
                    },
                    totalPayout: {
                        $sum: {
                            $cond: [
                                { $eq: ["$page", "payout"] },
                                "$paymentWidthrawal",
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    totalAdd: 1,
                    totalWithdrawal: 1,
                    totalPayout: 1,
                }
            }
        ]);

        const paymentData = overallAdminPayments[0] || {
            totalAdd: 0,
            totalWithdrawal: 0,
            totalPayout: 0
        };

        

        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    totalPayout: paymentData.totalPayout,
                    totalWidthrawal: paymentData.totalWithdrawal,
                    totalAdd: paymentData.totalAdd
                },
            },
            { new: true }
        );



        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            page,
            limit,
            totalPages: Math.ceil(totalReferrals / limit),
            totalReferrals,
            data: referralUsersWithPayment,
            user,
            overallAdminPayments: overallAdminPayments ? overallAdminPayments[0] : "",
            AdminUser: AdminUser,
        });
    } catch (error) {
        console.error("Error fetching referral data:", error);
        return res.status(500).json({
            msg: "Internal Server Error",
            status: false,
        });
    }
});



exports.RefralCodeGetId = catchAsync(async (req, res) => {
    const userId = req.query?.id;

    let { page = 1, limit = 10, payment_date, name = "" } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    if (!userId) {
        return res.status(400).json({ msg: "User ID is missing", status: false });
    }

    try {
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
        if (name) {
            referralQuery.name = { $regex: new RegExp(name, "i") };
        }

        // Find all referred users
        const testReferrals = await User.find(referralQuery)
            .populate("CourseId", "title discountPrice category courseImage")
            .skip((page - 1) * limit)
            .limit(limit);

        const totalReferrals = await User.countDocuments(referralQuery);

        // Extract referred user IDs
        const referralUserIds = testReferrals.map(user => user._id);

        // Filter payments based on referred user IDs and match paymentDate
        const paymentFilter = {
            UserId: { $in: referralUserIds },
            payment_status: "success",
        };

        // If `paymentDate` is provided, add the date range filter
        // if (payment_date) {
        //     const startOfDay = new Date(payment_date);
        //     const endOfDay = new Date(payment_date);
        //     endOfDay.setUTCHours(23, 59, 59, 999); // End of the day

        //     paymentFilter.payment_date = {
        //         $gte: startOfDay,
        //         $lte: endOfDay,
        //     };
        // }


        if (payment_date) {
            const startOfDayIST = moment.tz(payment_date, "Asia/Kolkata").startOf("day");
            const endOfDayIST = moment.tz(payment_date, "Asia/Kolkata").endOf("day");

            const startUTC = startOfDayIST.clone().utc().toDate();
            const endUTC = endOfDayIST.clone().utc().toDate();

            paymentFilter.payment_date = { $gte: startUTC, $lte: endUTC };
        }


        // Fetch the payment data
        const paymentReferralData = await Payment.find(paymentFilter).lean();



        if (!paymentReferralData || paymentReferralData.length === 0) {
            return res.status(204).json({
                msg: "No payments found for the provided filters.",
                status: false,
                data: [],
            });
        }


        // Fetch referral codes for referred users
        const referralCodes = await RefralModel.find({
            $or: [
                { userId: { $in: testReferrals.map(user => user.referred_by).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_first).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_second).filter(id => id !== null) } },
            ],
        }).sort({ created_at: -1 });

        // Combine referral data with payment data
        const referralUsersWithPayment = testReferrals.map(referralUser => {
            const referralCode = referralCodes.find(
                code => code.userId.toString() === referralUser.referred_by?.toString()
            );
            const paymentData = paymentReferralData.filter(
                pay => pay.UserId.toString() === referralUser._id.toString()
            );
            return {
                ...referralUser.toObject(),
                paymentDetails: paymentData.length > 0 ? paymentData : null,
                referral_code: referralCode ? referralCode.referral_code : null,
            };
        });

        // Fetch admin user data (optional)
        const AdminUser = await User.findOne({
            role: "admin",
        });

        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            page,
            limit,
            totalPages: Math.ceil(totalReferrals / limit),
            totalReferrals,
            data: referralUsersWithPayment,
            user,
            AdminUser: AdminUser,
            // payment: payments.length > 0 ? payments[0] : null,
        });
    } catch (error) {
        console.error("Error fetching referral data:", error);
        return res.status(500).json({
            msg: "Internal Server Error",
            status: false,
        });
    }
});


exports.RefralCodeDelete = catchAsync(async (req, res) => {
    try {
        const { Id } = req.params;
        const RefralDelete = await RefralModel.findByIdAndDelete({ _id: Id });
        res.json({
            status: true,
            data: RefralDelete,
            message: "Refral deleted successfully"
        })
    } catch (error) {
        logger.error(error);
        console.log("error", error)
        res.json({
            msg: "Refral  Failed ",
            status: false,
            error: error.message
        })

    }
})