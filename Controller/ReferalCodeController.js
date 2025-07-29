const UserModel = require("../Model/User");
const AdminPay = require("../Model/Adminpay");
const RefralModel = require("../Model/Referal");
const logger = require("../utill/Loggers");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const Payment = require("../Model/Payment");
const moment = require("moment-timezone");

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

    const now = moment().tz("Asia/Kolkata");
    const todayStart = now.clone().startOf("day").utc().toDate();
    const todayEnd = now.clone().endOf("day").utc().toDate();
    const weekStart = now.clone().startOf("week").utc().toDate();
    const weekEnd = now.clone().endOf("week").utc().toDate();
    const monthStart = now.clone().startOf("month").utc().toDate();
    const monthEnd = now.clone().endOf("month").utc().toDate();

    const referralQuerys = {
        $or: [
            { referred_by: userId },
            { referred_first: userId },
            { referred_second: userId },
        ],
    };

    const referredUsers = await User.find(referralQuerys)
        .select("-password -OTP")
        .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
        .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
        .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
        .populate({ path: "referred_second", model: "User", select: "name email referral_code" });

    const referralUserIdss = referredUsers.map(user => user._id);


    const paymentFilter = {
        UserId: { $in: referralUserIdss },
        payment_status: "success",
    };

    const paymentss = await Payment.find(paymentFilter).lean();


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
            .select("-password -OTP")
            .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
            .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_second", model: "User", select: "name email referral_code" })
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

        const Course = User


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

        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const currentWeekIdentifier = moment().format('YYYY-WW');   // e.g., "2025-27" (for ISO week)
        const currentMonthIdentifier = moment().format('YYYY-MM'); // e.g., "2025-07"


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

       // Weekly Payment Calculation
        let WeekPayment = 0;
        if (Course?.lastPaymentWeek === currentWeekIdentifier) {
            WeekPayment = ((totals?.week) + (totalweekAddPayment) - (totalweekPaymentWithdrawal))
        }

        console.log("WeekPayment" ,WeekPayment)
        let MonthPayment = 0;
        if (Course?.lastPaymentMonth === currentMonthIdentifier) {
            MonthPayment = ((totals?.month) - (totalMonthPaymentWithdrawal || 0) + (totalMonthAddPayment || 0));
        }

        const OverAllPayment = ((totals?.overall) + (totalAdd) - (totalPaymentWithdrawal))


        console.log("OverAllPayment", OverAllPayment)

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
            datapayment: datapayment,
            WeekPayment: WeekPayment,
            MonthPayment: MonthPayment,
            OverAllPayment: OverAllPayment,
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


    const now = moment().tz("Asia/Kolkata");
    const todayStart = now.clone().startOf("day").utc().toDate();
    const todayEnd = now.clone().endOf("day").utc().toDate();
    const weekStart = now.clone().startOf("week").utc().toDate();
    const weekEnd = now.clone().endOf("week").utc().toDate();
    const monthStart = now.clone().startOf("month").utc().toDate();
    const monthEnd = now.clone().endOf("month").utc().toDate();

    const referralQuerys = {
        $or: [
            { referred_by: userId },
            { referred_first: userId },
            { referred_second: userId },
        ],
    };

    const referredUsers = await User.find(referralQuerys)
        .select("-password -OTP")
        .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
        .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
        .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
        .populate({ path: "referred_second", model: "User", select: "name email referral_code" });

    const referralUserIdss = referredUsers.map(user => user._id);


    const paymentFilter = {
        UserId: { $in: referralUserIdss },
        payment_status: "success",
    };

    const paymentss = await Payment.find(paymentFilter).lean();


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
            .select("-password -OTP")
            .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
            .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_second", model: "User", select: "name email referral_code" })
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