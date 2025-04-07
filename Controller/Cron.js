const moment = require('moment');
const CronEmail = require("../Mail/CronEmail");
const User = require('../Model/User');
const cron = require('node-cron');

a
cron.schedule('*/1 * * * *', async () => {
    try {
      console.log('Running daily payment reset job...');
      const currentDate = moment();
      const currentMonth = currentDate.format('YYYY-MM');
      const currentWeek = currentDate.format('YYYY-WW');
      const currentDay = currentDate.format('YYYY-MM-DD');
      const users = await User.find({ role: "user" });
  
      for (let user of users) {
        let updates = {};
  
        if (user.lastPaymentDay !== currentDay) {
          updates.lastTodayIncome = (user.lastTodayIncome || 0) + (user.referred_user_pay_daily || 0) + (user.referred_user_pay);
          updates.referred_user_pay_daily = 0;
          updates.payment_key_daily = 0;
          updates.referred_user_pay = 0;
          updates.lastPaymentDay = currentDay;
        }
  
        if (user.lastPaymentWeek !== currentWeek) {
          updates.referred_user_pay_weekly = 0;
          updates.lastPaymentWeek = currentWeek;
        }
  
  
        if (user.lastPaymentMonth !== currentMonth) {
          updates.referred_user_pay_monthly = 0;
          updates.pervious_passive_income_month = (user.second_user_pay || 0) + (user.first_user_pay);
          user.second_user_pay = 0;
          user.first_user_pay = 0;
          updates.lastPaymentMonth = currentMonth;
        }
  
        if (Object.keys(updates).length > 0) {
          await User.findByIdAndUpdate(user._id, updates, { new: true });
        }
      }
      console.log('Payment reset job completed successfully.');
  
      const subject = "✅ Daily Cron Job Completed";
      await sendEmail({
        email: "ankitkumarjain0748@gmail.com",
        name: "Admin",
        message: "The daily payment reset job has been successfully completed at midnight.",
        subject: subject,
        emailTemplate: CronEmail,
      });
    } catch (error) {
      console.error('Error running payment reset job:', error);
    }
  });
  
  
  
  // 0 0 * * *	12:00 AM (midnight)
  // 10 4 * * *	4:10 AM daily
  // 30 9 * * *	9:30 AM daily
  // 0 18 * * *	6:00 PM daily
  // 0 */6 * * *	हर 6 घंटे में
  // */10 * * * *	हर 10 मिनट में

  // cron.schedule('*/1 * * * *', async () => {
//   try {
//     console.log('Running daily payment reset job...');

//     console.log("users5")

//     const subject = "✅ Daily Cron Job Completed";
//     await sendEmail({
//       email: "ankitkumarjain0748@gmail.com",
//       name: "Admin",
//       message: "The daily payment reset job has been successfully completed at midnight.",
//       subject: subject,
//       emailTemplate: CronEmail,
//     });
//     console.log("users6")


//   } catch (error) {
//     console.error('Error running payment reset job:', error);
//   }
// });
  