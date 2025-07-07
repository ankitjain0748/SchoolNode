const User = require("../Model/User");
const AdminPayment = require("../Model/Adminpay");
const catchAsync = require("../utill/catchAsync");
const moment = require("moment");
const sendEmail = require("../utill/Emailer");
const Payout = require("../Mail/Payout")

exports.payoutData = catchAsync(async (req, res) => {
    try {
        const {
            Id, data_payment, success_reasons, payment_type, paymentMethod,
            transactionId, payment_data, payment_income,
            referred_user_pay, payment_key, page, withdrawal_reason,
            paymentWidthrawal, payment_Add, payoutpayment
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
        let UnPaidAmounts = user.UnPaidAmounts - payment_key || 0;

        // Reset values when period changes
        if (user.lastPaymentMonth !== currentMonth) updatedReferredUserPayMonthly = 0;
        if (user.lastPaymentWeek !== currentWeek) updatedReferredUserPayWeekly = 0;
        // Add current payments
        const referralAmount = Number(payment_Add) || 0;
        updatedLastTodayIncome += referralAmount;
        updatedReferredUserPayOverall += referralAmount;
        updatedReferredUserPayMonthly += referralAmount;
        updatedReferredUserPayWeekly += referralAmount;
        updatedReferredUserPayDaily += referralAmount;
        updatedPaymentKey += Number(paymentWidthrawal) || 0;

        const newPayment = new AdminPayment({
            userId: Id, paymentMethod, payment_type, success_reasons,
            paymentWidthrawal, withdrawal_reason, payment_key,
            transactionId, payment_data, payment_income, data_payment, page,
            referred_user_pay, payment_Add, payoutpayment
        });
        const paymentRecord = await newPayment.save();
        if (!paymentRecord) {
            return res.status(400).json({
                status: false,
                message: "Failed to save payment data."
            });
        }
        // Update user payment data
        const incFields = {
            ...(payment_Add && { totalAdd: payment_Add }),
            ...(paymentWidthrawal && { totalWidthrawal: paymentWidthrawal }),
            ...(payoutpayment && { totalPayout: payoutpayment }),
        };
        const withdrawal = Number(paymentWidthrawal) || 0;
        const payout = Number(payoutpayment) || 0;
        
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        let paymentmanage = Number(user.paymentmanage) || 0;
        
        if (page !== "Add" || currentDate === today) {
            paymentmanage += withdrawal + payout;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            Id,
            {
                $set: {
                    payment_Add, payment_data,  referred_user_pay,
                    referred_user_pay_overall: updatedReferredUserPayOverall,
                    referred_user_pay_monthly: updatedReferredUserPayMonthly,
                    referred_user_pay_weekly: updatedReferredUserPayWeekly,
                    referred_user_pay_daily: updatedReferredUserPayDaily,
                    lastTodayIncome: updatedLastTodayIncome,
                    unPaidAmounts: UnPaidAmounts,
                    lastPaymentMonth: currentMonth,
                    lastPaymentWeek: currentWeek,
                    lastPaymentDay: currentDay,
                    payment_key_daily: updatedPaymentKey,
                    paymentmanage 
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

        res.status(200).json({
            status: true,
            message: "Payment data saved and user updated successfully.",
            paymentRecord,
            updatedUser
        });

        // Send email notification on successful payout
        if (page === "payout") {
            const subject1 = "🎉 Your Payout Has Been Successfully Received!";
            const from = "StackEarn Payouts <payouts@stackearn.com>"

            await sendEmail({
                email: updatedUser.email,
                name: updatedUser.name,
                Webniarrecord: paymentRecord,
                subject: subject1,
                emailTemplate: Payout,
                from: from
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