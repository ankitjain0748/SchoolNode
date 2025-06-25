const cron = require('node-cron');
const moment = require('moment');
const User = require('./Model/User');
const sendEmail = require('./utill/Emailer');
const CronEmail = require('./Mail/CronEmail');
const Loggers = require('./utill/Loggers');

function initCronJobs() {
    // ✅ DAILY CRON JOB
    cron.schedule('0 0 * * *', async () => {
        try {
            Loggers.info('⏰ Daily Cron Job started');
            const currentDay = moment().format('YYYY-MM-DD');
            const users = await User.find({ role: "user" });

            Loggers.info(`🧑‍🤝‍🧑 Found ${users.length} users`);

            for (let user of users) {
                let updates = {};

                if (user.lastPaymentDay !== currentDay) {
                    const lastTodayIncome = Number(user.lastTodayIncome) || 0;
                    const referredDaily = Number(user.referred_user_pay_daily) || 0;
                    const referredPay = Number(user.referred_user_pay) || 0;
                    const referredOverall = Number(user.referred_user_pay_overall) || 0;
                    const referredMonthly = Number(user.referred_user_pay_monthly) || 0;
                    const referredWeekly = Number(user.referred_user_pay_weekly) || 0;
                    const passive1 = Number(user.first_user_pay) || 0;
                    const passive2 = Number(user.second_user_pay) || 0;
                    const todayPayment = Number(user.paymentmanage) || 0;

                    updates.UnPaidAmounts = lastTodayIncome;
                    updates.lastTodayIncome = lastTodayIncome + referredDaily + referredPay;
                    updates.referred_user_pay_overall = lastTodayIncome + referredOverall + referredPay;
                    updates.referred_user_pay_monthly = lastTodayIncome + referredMonthly + referredPay;
                    updates.referred_user_pay_weekly = lastTodayIncome + referredWeekly + referredPay;
                    updates.passive_income = passive1 + passive2;
                    updates.TodayPayment = todayPayment;
                    updates.referred_user_pay_daily = 0;
                    updates.referred_user_pay = 0;
                    updates.lastPaymentDay = currentDay;
                    updates.paymentmanage = 0;
                }

                if (Object.keys(updates).length > 0) {
                    await User.findByIdAndUpdate(user._id, updates, { new: true });
                    Loggers.info(`✅ Updated user: ${user._id}`);
                }
            }

            const from = "StackEarn Cron Daily <no-reply@stackearn.com>";

            await sendEmail({
                email: "ankitkumarjain0748@gmail.com",
                name: "Admin",
                message: "Render Application Daily Cron Job",
                subject: "✅ Daily Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            await sendEmail({
                email: "sainibhim133@gmail.com",
                name: "Admin",
                message: "The daily payment reset job has been successfully completed at 7:15 AM.",
                subject: "✅ Daily Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            Loggers.info("✅ Daily Cron Job completed successfully");
        } catch (error) {
            Loggers.error(`❌ Error in daily payment reset job: ${error.message}`);
        }
    });

    // ✅ WEEKLY CRON JOB
    cron.schedule('0 0 * * 1', async () => {
        try {
            Loggers.info('⏰ Weekly Cron Job started');
            const currentWeek = moment().format('YYYY-WW');
            const users = await User.find({ role: "user" });

            for (let user of users) {
                let updates = {};
                if (user.lastPaymentWeek !== currentWeek) {
                    updates.referred_user_pay_weekly = 0;
                    updates.lastPaymentWeek = currentWeek;
                }

                if (Object.keys(updates).length > 0) {
                    await User.findByIdAndUpdate(user._id, updates, { new: true });
                    Loggers.info(`✅ Weekly update for user: ${user._id}`);
                }
            }

            const from = "StackEarn Cron Weekly <no-reply@stackearn.com>";

            await sendEmail({
                email: "ankitkumarjain0748@gmail.com",
                name: "Admin",
                message: "The weekly payment reset job has been successfully completed.",
                subject: "✅ Weekly Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            await sendEmail({
                email: "sainibhim133@gmail.com",
                name: "Admin",
                message: "The weekly payment reset job has been successfully completed.",
                subject: "✅ Weekly Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            Loggers.info("✅ Weekly Cron Job completed successfully");
        } catch (error) {
            Loggers.error(`❌ Error in weekly payment reset job: ${error.message}`);
        }
    });

    // ✅ MONTHLY CRON JOB
    cron.schedule('15 0 28-31 * *', async () => {
        const today = moment();
        if (today.date() !== today.endOf('month').date()) {
            Loggers.info("📅 Monthly Cron skipped — Not last day of month");
            return;
        }

        try {
            Loggers.info('⏰ Monthly Cron Job started');
            const currentMonth = moment().format('YYYY-MM');
            const users = await User.find({ role: "user" });

            for (let user of users) {
                let updates = {};

                if (user.lastPaymentMonth !== currentMonth) {
                    updates.referred_user_pay_monthly = 0;
                    updates.lastTodayIncome = (user.lastTodayIncome || 0) + (user.second_user_pay || 0) + (user.first_user_pay);
                    updates.pervious_passive_income_month = (user.second_user_pay || 0) + (user.first_user_pay);
                    updates.lastPaymentMonth = currentMonth;
                    updates.second_user_pay = 0;
                    updates.first_user_pay = 0;
                }

                if (Object.keys(updates).length > 0) {
                    await User.findByIdAndUpdate(user._id, updates, { new: true });
                    Loggers.info(`✅ Monthly update for user: ${user._id}`);
                }
            }

            const from = "StackEarn Cron Monthly <no-reply@stackearn.com>";

            await sendEmail({
                email: "ankitkumarjain0748@gmail.com",
                name: "Admin",
                message: "The monthly payment reset job has been successfully completed.",
                subject: "✅ Monthly Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            await sendEmail({
                email: "sainibhim133@gmail.com",
                name: "Admin",
                message: "The monthly payment reset job has been successfully completed.",
                subject: "✅ Monthly Cron Job Completed",
                emailTemplate: CronEmail,
                from
            });

            Loggers.info("✅ Monthly Cron Job completed successfully");
        } catch (error) {
            Loggers.error(`❌ Error in monthly payment reset job: ${error.message}`);
        }
    });
}

module.exports = initCronJobs;
