const moment = require("moment-timezone");
const User = require("../Model/User");
const Payment = require("../Model/Payment");
const RefralModel = require("../Model/Referal");

async function getReferralEarnings(userId) {
    console.log("Fetching referral earnings for user:", userId);
    try {
        const referralQuery = {
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId },
            ],
        };

        const testReferrals = await User.find(referralQuery)
            .select("-password -OTP")
            .populate({ path: "CourseId", select: "title discountPrice category courseImage" })
            .populate({ path: "referred_by", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_first", model: "User", select: "name email referral_code" })
            .populate({ path: "referred_second", model: "User", select: "name email referral_code" });

        const totalReferrals = await User.countDocuments(referralQuery);
        const referralUserIds = testReferrals.map(user => user._id);

        const paymentFilter = {
            UserId: { $in: referralUserIds },
            payment_status: "success",
        };

        const paymentReferralData = await Payment.find(paymentFilter).lean();

        if (!paymentReferralData || paymentReferralData.length === 0) {
            return {
                status: false,
                msg: "No payments found.",
                totalReferrals,
                totals: {},
                data: [],
            };
        }

        const referralCodes = await RefralModel.find({
            $or: [
                { userId: { $in: testReferrals.map(u => u.referred_by).filter(Boolean) } },
                { userId: { $in: testReferrals.map(u => u.referred_first).filter(Boolean) } },
                { userId: { $in: testReferrals.map(u => u.referred_second).filter(Boolean) } },
            ],
        }).sort({ created_at: -1 });

        const now = moment().tz("Asia/Kolkata");
        const todayStart = now.clone().startOf("day").utc().toDate();
        const todayEnd = now.clone().endOf("day").utc().toDate();
        const weekStart = now.clone().startOf("week").utc().toDate();
        const weekEnd = now.clone().endOf("week").utc().toDate();
        const monthStart = now.clone().startOf("month").utc().toDate();
        const monthEnd = now.clone().endOf("month").utc().toDate();

        const totals = {
            today: { direct: 0, first: 0, second: 0, overall: 0 },
            week: { direct: 0, first: 0, second: 0, overall: 0 },
            month: { direct: 0, first: 0, second: 0, overall: 0 },
            overall: { direct: 0, first: 0, second: 0, overall: 0 },
        };

        const referralUsersWithPayment = testReferrals.map(referralUser => {
            const referralCode = referralCodes.find(code =>
                code.userId &&
                referralUser.referred_by &&
                code.userId === referralUser.referred_by
            );

            const paymentData = paymentReferralData.filter(
                pay => pay.UserId && pay.UserId === referralUser._id
            );

            paymentData.forEach(payment => {
                const payDate = new Date(payment.payment_date);

                const isToday = payDate >= todayStart && payDate <= todayEnd;
                const isWeek = payDate >= weekStart && payDate <= weekEnd;
                const isMonth = payDate >= monthStart && payDate <= monthEnd;

                let level = "";
                if (referralUser.referred_by === userId) level = "direct";
                else if (referralUser.referred_first === userId) level = "first";
                else if (referralUser.referred_second === userId) level = "second";

                let amount = 0;
                if (level === "direct") {
                    amount = payment.referredData1?.userId === userId
                        ? payment.referredData1?.payAmount || 0
                        : 0;
                } else if (level === "first") {
                    amount = payment.referredData2?.userId === userId
                        ? payment.referredData2?.payAmount || 0
                        : 0;
                } else if (level === "second") {
                    amount = payment.referredData3?.userId === userId
                        ? payment.referredData3?.payAmount || 0
                        : 0;
                }

                if (amount > 0 && level) {
                    totals.overall[level] += amount;
                    totals.overall.overall += amount;

                    if (isToday) {
                        totals.today[level] += amount;
                        totals.today.overall += amount;
                    }
                    if (isWeek) {
                        totals.week[level] += amount;
                        totals.week.overall += amount;
                    }
                    if (isMonth) {
                        totals.month[level] += amount;
                        totals.month.overall += amount;
                    }
                }
            });

            return {
                ...referralUser.toObject(),
                paymentDetails: paymentData.length > 0 ? paymentData : null,
                referral_code: referralCode ? referralCode.referral_code : null,
            };
        });

        return {
            status: true,
            msg: "Referral data fetched successfully.",
            totalReferrals,
            totals,
        };

    } catch (error) {
        console.error("Referral earnings error:", error);
        return {
            status: false,
            msg: "Something went wrong.",
            error: error.message,
        };
    }
}

module.exports = getReferralEarnings;
