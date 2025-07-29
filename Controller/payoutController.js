const User = require("../Model/User");
const AdminPayment = require("../Model/Adminpay");
const catchAsync = require("../utill/catchAsync");
const moment = require("moment");
const sendEmail = require("../utill/Emailer");
const Payout = require("../Mail/Payout");

exports.payoutData = catchAsync(async (req, res) => {
    const {
        Id, data_payment, success_reasons, payment_type, paymentMethod,
        transactionId, payment_data, payment_income,
        referred_user_pay, payment_key, page, withdrawal_reason,
        paymentWidthrawal, payment_Add, payoutpayment
    } = req.body;

    if (!Id) {
        return res.status(400).json({ status: false, message: "User ID is required." });
    }

    const currentDate = moment();
    const currentMonth = currentDate.format("YYYY-MM");
    const currentWeek = currentDate.format("YYYY-WW");
    const currentDay = currentDate.format("YYYY-MM-DD");
    const today = new Date().toISOString().split("T")[0];

    const user = await User.findById(Id);
    if (!user) {
        return res.status(404).json({ status: false, message: "User not found!" });
    }

    // Initialize values
    let referralAmount = Number(payment_Add) || 0;
    let withdrawal = Number(paymentWidthrawal) || 0;
    let payout = Number(payoutpayment) || 0;
    let unPaidAmount = Number(user.UnPaidAmounts) || 0;

    // Handle unpaid logic
    if (referralAmount > 0) {
        unPaidAmount += referralAmount; }
    // } else if (withdrawal > 0 || payout > 0) {
    //     unPaidAmount -= (withdrawal + payout);
    // }

    // Handle reset logic
    let updatedReferredUserPayOverall = user.referred_user_pay_overall || 0;
    let updatedReferredUserPayMonthly = (user.lastPaymentMonth === currentMonth) ? user.referred_user_pay_monthly || 0 : 0;
    let updatedReferredUserPayWeekly = (user.lastPaymentWeek === currentWeek) ? user.referred_user_pay_weekly || 0 : 0;
    let updatedReferredUserPayDaily = user.referred_user_pay_daily || 0;
    let updatedLastTodayIncome = (user.lastTodayIncome || 0) + referralAmount;
    let updatedPaymentKey = (user.payment_key_daily || 0) + withdrawal;

    // Update referral income counters
    updatedReferredUserPayOverall += referralAmount;
    updatedReferredUserPayMonthly += referralAmount;
    updatedReferredUserPayWeekly += referralAmount;
    updatedReferredUserPayDaily += referralAmount;

    let paymentmanage = Number(user.paymentmanage) || 0;
    if (page !== "Add" || currentDay === today) {
        paymentmanage += withdrawal + payout;
    }

    const newPayment = new AdminPayment({
        userId: Id,
        paymentMethod,
        payment_type,
        success_reasons,
        paymentWidthrawal,
        withdrawal_reason,
        payment_key,
        transactionId,
        payment_data,
        payment_income,
        data_payment,
        page,
        referred_user_pay,
        payment_Add,
        payoutpayment
    });

    const paymentRecord = await newPayment.save();
    if (!paymentRecord) {
        return res.status(400).json({
            status: false,
            message: "Failed to save payment data."
        });
    }

    const incFields = {
        ...(referralAmount > 0 && { totalAdd: referralAmount }),
        ...(withdrawal > 0 && { totalWidthrawal: withdrawal }),
        ...(payout > 0 && { totalPayout: payout })
    };

    const updatedUser = await User.findByIdAndUpdate(
        Id,
        {
            $set: {
                payment_Add,
                payment_data,
                referred_user_pay,
                referred_user_pay_overall: updatedReferredUserPayOverall,
                referred_user_pay_monthly: updatedReferredUserPayMonthly,
                referred_user_pay_weekly: updatedReferredUserPayWeekly,
                referred_user_pay_daily: updatedReferredUserPayDaily,
                lastTodayIncome: updatedLastTodayIncome,
                lastPaymentMonth: currentMonth,
                lastPaymentWeek: currentWeek,
                lastPaymentDay: currentDay,
                payment_key_daily: updatedPaymentKey,
                paymentmanage,
                UnPaidAmounts: unPaidAmount
            },
            $inc: incFields
        },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        return res.status(404).json({
            status: false,
            message: "User not found for update!"
        });
    }

    // Respond first
    res.status(200).json({
        status: true,
        message: "Payment data saved and user updated successfully.",
        paymentRecord,
        updatedUser
    });

    // Send email after response
    if (page === "payout") {
        try {
            const subject1 = "🎉 Your Payout Has Been Successfully Received!";
            const from = "StackEarn Payouts <payouts@stackearn.com>";

            await sendEmail({
                email: updatedUser.email,
                name: updatedUser.name,
                Webniarrecord: paymentRecord,
                subject: subject1,
                emailTemplate: Payout,
                from: from
            });
        } catch (emailErr) {
            console.error("Email sending failed:", emailErr.message);
        }
    }
});
