const Payment = require("../Model/Payment");
const AdminPays = require("../Model/Adminpay");
const Course = require("../Model/Course");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

require('dotenv').config();
const catchAsync = require("../utill/catchAsync");
const Razorpay = require('razorpay');
const logger = require("../utill/Loggers");
const User = require("../Model/User");
const Transaction = require("../Model/Transcation");
const sendEmail = require("../utill/Emailer");
const Purchase = require("../Mail/Purchase")
const AdminPurchase = require("../Mail/AdminPurchase");
const ProfileData = require("../Model/Profile");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = catchAsync(async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;
  try {
    if (!amount || !currency || !receipt) {
      logger.warn('Amount, currency, and receipt are required.')
      return res.status(400).json({
        status: false,
        message: 'Amount, currency, and receipt are required.',
      });
    }
    const options = {
      amount: amount * 100, // Convert to smallest currency unit (e.g., paise)
      currency,
      receipt,
      payment_capture: 1, // Auto-capture payments
    };

    logger.info('Creating Razorpay order with options:', options);
    const order = await razorpayInstance.orders.create(options);
    logger.info('Order created successfully:', order);
    res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Order creation failed',
      error: error.message,
    });
  }
});



exports.paymentAdd = catchAsync(async (req, res) => {
  try {

    const UserId = req.User._id;
    const { order_id, payment_id, amount, currency, payment_status, CourseId, payment_method,
      address, home_address, remember, saveInfo, sameAsBilling, phone_number, state, country, zip } = req.body;
    const user = await User.findById(UserId);
    const fullAddress = `${address}, ${state}, ${country} - ${zip}`;
    if (payment_status === "success") {
      if (user) {
        const existingProfile = await ProfileData.findOne({ userId: UserId });
        if (existingProfile) {
          const updatedProfile = await ProfileData.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(UserId) }, // 🔹 यहां सही किया
            {
              phone_number: phone_number,
              address: fullAddress,
            },
            { new: true, runValidators: true }
          );
        } else {
          const newProfile = new ProfileData({
            userId: new mongoose.Types.ObjectId(UserId), // 🔹 यहां सही किया
            phone_number: phone_number,
            address: fullAddress,
          });

          const recorddata = await newProfile.save();
        }
      }
    }


    if (!order_id || !payment_id || !amount || !CourseId) {
      logger.warn("Missing required fields");
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    const status = payment_status === "failed" ? "failed" : "success";

    const payment = new Payment({
      order_id,
      currency,
      payment_id,
      amount,
      state, country, zip, home_address, remember, saveInfo, sameAsBilling,
      payment_status,
      UserId,
      status,
      CourseId,
      payment_method
    });

    const record = await payment.save();

    const coursedata = await Course.findOne({ _id: CourseId });

    if (!coursedata) {
      return res.status(404).json({ status: false, message: "Course not found" });
    }
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (payment_status === "success") {

      const subject = `Thank You for Your Purchase! ${coursedata.title} is Now Available for You 🎉`;
      const subject1 = `New Course Purchase: ${coursedata.title} by ${user.name} 🎉`;
      const from = "StackEarn Transaction <billing@stackearn.com>"
      const from1 = "StackEarn Transaction <admin@stackearn.com>"
      if (user) {
        await sendEmail({
          email: user.email,
          name: user.name,
          payment: record,
          cousreData: coursedata.title,
          message: "Your booking request was successful!",
          subject: subject,
          emailTemplate: Purchase,
          from: from,
        });
      }

      await sendEmail({
        email: "sainibhim133@gmail.com",
        name: "Admin",
        datauser: user,
        payment: record,
        cousreData: coursedata.title,
        message: "Your booking request was successful!",
        subject: subject1,
        emailTemplate: AdminPurchase,
        from: from1
      });

      const { referred_by, referred_first, referred_second } = user;

      const updateReferredUser = async (referredUserId, userKey, amountKey, discountPrice, newUserDiscountPrice) => {
        if (!referredUserId) return;

        const referredUser = await User.findById(referredUserId).populate("CourseId");


        if (!referredUser?.CourseId) {
          return;
        }

        let applicableDiscountPrice = 0;
        if (userKey === "directuser") {
          applicableDiscountPrice = referredUser?.CourseId?.directuser || 0;
        } else if (userKey === "firstuser") {
          applicableDiscountPrice = referredUser?.CourseId?.firstuser || 0;
        } else if (userKey === "seconduser") {
          applicableDiscountPrice = referredUser?.CourseId?.seconduser || 0;
        }
        if (userKey === "directuser") {
          if (referredUser?.CourseId?.discountPrice >= discountPrice) {
            const finalDiscountPrice = newUserDiscountPrice === 0 ? applicableDiscountPrice : newUserDiscountPrice;
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: finalDiscountPrice } // ✅ Increment fields
              },
              { new: true }
            );

            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey, // Stores which referral type the user is
                  [`referredData${userKey === "directuser" && 1}`]: {
                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: finalDiscountPrice,
                  }
                },
              },
              { new: true }
            );


          } else {
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: applicableDiscountPrice } // ✅ Increment fields
              },
              { new: true }
            );
            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey,
                  [`referredData${userKey === "directuser" && 1}`]: {
                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: applicableDiscountPrice,
                  }
                },
              },
              { new: true }
            );

          }
        }
        if (userKey === "firstuser") {
          if (referredUser?.CourseId?.discountPrice < coursedata?.discountPrice) {
            const finalDiscountPrice = newUserDiscountPrice === 0 ? applicableDiscountPrice : newUserDiscountPrice;
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: finalDiscountPrice } // ✅ Increment fields
              },
              { new: true }
            );

            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey, // Stores which referral type the user is
                  [`referredData${userKey === "firstuser" && 2}`]: {
                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: finalDiscountPrice,
                  }
                },
              },
              { new: true }
            );


          } else {
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: coursedata?.firstuser } // ✅ Increment fields
              },
              { new: true }
            );
            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey, // Stores which referral type the user is
                  [`referredData${userKey === "firstuser" && 2}`]: {
                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: coursedata?.firstuser,
                  }
                },
              },
              { new: true }
            );

          }
        };


        if (userKey === "seconduser") {
          if (referredUser?.CourseId?.discountPrice < coursedata?.discountPrice) {
            const finalDiscountPrice = newUserDiscountPrice === 0 ? applicableDiscountPrice : newUserDiscountPrice;
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: finalDiscountPrice } // ✅ Increment fields
              },
              { new: true }
            );

            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey, // Stores which referral type the user is
                  [`referredData${userKey === "seconduser" && 3}`]: {

                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: finalDiscountPrice,
                  }
                },
              },
              { new: true }
            );


          } else {
            await User.findByIdAndUpdate(
              referredUserId,
              {
                $set: { referred_user_type: userKey }, // ✅ Set referred_user_type correctly
                $inc: { [userKey]: 1, [amountKey]: coursedata?.seconduser } // ✅ Increment fields
              },
              { new: true }
            );
            await Payment.findByIdAndUpdate(
              payment._id,
              {
                $set: {
                  referred_user_type: userKey, // Stores which referral type the user is
                  [`referredData${userKey === "seconduser" && 3}`]: {

                    userId: referredUserId, // ✅ Storing referred user's ID
                    userType: userKey,
                    payAmount: coursedata?.seconduser,
                  }
                },
              },
              { new: true }
            );

          }
        }
      };

      await updateReferredUser(referred_by, "directuser", "referred_user_pay", coursedata.discountPrice, coursedata?.directuser || 0);
      await updateReferredUser(referred_first, "firstuser", "first_user_pay", coursedata.discountPrice, coursedata?.referred_first || 0);
      await updateReferredUser(referred_second, "seconduser", "second_user_pay", coursedata.discountPrice, coursedata?.referred_second || 0);


      if (payment_status === "success") {
        const data = await User.findByIdAndUpdate(
          UserId,
          { $set: { CourseId: CourseId, user_status: "Enrolled", ref_date: new Date() } },
          { new: true }
        );
      }
     

      return res.status(200).json({
        status: "success",
        message: "Payment verified and saved successfully",
        data,
      });
    }

    if (payment_status === "failed") {
      return res.status(200).json({
        status: "failed",
        message: "Payment failed, please try again",
      });
    }

  } catch (error) {
    console.log("Error Occurred:", error);
    logger.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while saving payment.",
      error: error.message,
    });
  }
});

exports.PaymentGet = catchAsync(async (req, res, next) => {
  try {

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    const selectOption = req.query.selectedOption?.trim() || "";
    const search = req.query.search?.trim() || "";
    const username = req.query.username?.trim() || "";
    const paymentDate = req.query.payment_date?.trim() || "";

    let query = {};

    // Add search filter (using regex for partial matches)
    if (username) {
      const users = await User.find(
        { name: { $regex: username, $options: "i" } },
        "_id"
      );
      const userIds = users.map(user => user._id);
      query.UserId = userIds;
    }

    // Add username filter (exact match)
    // if (username) {
    //   const user = await User.findOne({ name: { $regex: `^${username}$`, $options: "i" } });
    //   query.userId = user ? user._id : null; // Assign userId or null
    // }

    // Add selected option filter
    if (search) {
      query.payment_id = search;
    }

    if (selectOption) {
      query.payment_status = selectOption;
    }
    if (paymentDate) {
      const startOfDayIST = moment.tz(paymentDate, "Asia/Kolkata").startOf("day");
      const endOfDayIST = moment.tz(paymentDate, "Asia/Kolkata").endOf("day");
    
      const startUTC = startOfDayIST.clone().utc().toDate();
      const endUTC = endOfDayIST.clone().utc().toDate();
    
      query.payment_date = { $gte: startUTC, $lte: endUTC };
    }
    

    // Fetch total count and pages
    const totalUsers = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Fetch payment data with pagination and sorting
    const payments = await Payment.find(query)
      .populate("UserId")
      .populate("CourseId")
      .sort({ payment_date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Return appropriate responses
    if (!payments || payments.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found.",
        payment: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Payments retrieved successfully!",
      payments,
      totalUsers,
      totalPages,
      currentPage: page,
      perPage: limit,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});

exports.PaymentGetCourse = catchAsync(async (req, res, next) => {
  const UserId = req.User._id;
  try {
    const UserPayments = await Payment.find({ UserId }).populate("UserId").populate("CourseId");
    if (!UserPayments || UserPayments.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        Payments: [],
      });
    }
    const Payments = await Payment.findOne({ UserId });

    const CourseIds = UserPayments.map((payment) => payment.CourseId);
    const courses = await Course.find({ _id: { $in: CourseIds } }).populate("InstrutorId").sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: "Courses retrieved successfully!",
      Payments: UserPayments,
      PaymentsData :Payments,
      Courses: courses,
    });
    
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});

exports.PaymentGetdata = catchAsync(async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 15, 1);
    const skip = (page - 1) * limit;


    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const selectoption = req.query.selectedOption ? String(req.query.selectedOption).trim() : "";
    // const paymentDate = req.query.payment_date ? req.query.payment_date : null;
    const paymentDate = req.query.payment_date?.trim() || "";


    const filter = {};

    // 🔍 Search by user name
    if (searchQuery) {
      const users = await User.find({ name: { $regex: searchQuery, $options: "i" } }, '_id');
      const userIds = users.map(user => user._id);
      filter.userId = { $in: userIds };
    }

    // 📄 Filter by payment type
    if (selectoption) {
      filter.page = selectoption;
    }

    // 📅 Filter by payment date (only date, ignoring time)
    if (paymentDate) {
      const startOfDayIST = moment.tz(paymentDate, "Asia/Kolkata").startOf("day");
      const endOfDayIST = moment.tz(paymentDate, "Asia/Kolkata").endOf("day");
    
      const startUTC = startOfDayIST.clone().utc().toDate();
      const endUTC = endOfDayIST.clone().utc().toDate();
    
      filter.payment_date = { $gte: startUTC, $lte: endUTC };
    }
    

    const payment = await AdminPays.find(filter)
      .populate({
        path: "userId",
        select: "name phone_number phone_code email",
      })
      .sort({ payment_date: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await AdminPays.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      status: true,
      message: payment.length > 0 ? "Payments retrieved successfully!" : "No payments found.",
      payment,
      totalUsers,
      totalPages,
      currentPage: page,
      perPage: limit,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    });

  } catch (err) {
    logger.error(err);
    res.status(500).json({
      status: false,
      message: "An error occurred. Please try again later.",
    });
  }
});


exports.paymentdata = catchAsync(async (req, res) => {
  try {
    const userId = req.User?._id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;

    const searchDate = req.query.payment_date; // Get payment date from query params

    let query = { userId, page: "payout" };

    // If `payment_date` is provided, filter by date
    if (searchDate) {
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.payment_date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get total count for pagination
    const totalItems = await AdminPays.countDocuments(query);

    const payments = await AdminPays.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ payment_date: -1 }); // Sort by latest payments

    if (!payments || payments.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        payment: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Payment retrieved successfully!",
      payment: payments,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit), // Calculate total pages
      totalItems: totalItems,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});

exports.PaymentGetCourseId = catchAsync(async (req, res, next) => {
  try {
    // Fetch page and limit from query params, set defaults if not provided
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;

    // Fetch user payments with status "success"
    const UserPayments = await Payment.find({ payment_status: "success" })
      .populate("UserId")
      .populate("CourseId")
      .skip(skip)
      .limit(limit);

    if (!UserPayments || UserPayments.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        Payments: [],
      });
    }

    const CourseIds = UserPayments.map((payment) => payment.CourseId);
    const courses = await Course.find({ _id: { $in: CourseIds } }).populate("InstrutorId");

    // Fetch all payments to determine best-selling courses
    const allPayments = await Payment.find({ payment_status: "success" });

    const courseSalesCount = allPayments.reduce((acc, payment) => {
      const courseId = payment.CourseId.toString();
      acc[courseId] = (acc[courseId] || 0) + 1;
      return acc;
    }, {});

    // Sort course IDs by sales count in descending order
    const sortedCourseIds = Object.keys(courseSalesCount).sort((a, b) => courseSalesCount[b] - courseSalesCount[a]);
    const bestSellingCourseIds = sortedCourseIds.slice((page - 1) * limit, page * limit); // Pagination applied

    const bestSellingCourses = await Course.find({ _id: { $in: bestSellingCourseIds } }).populate("InstrutorId").sort({ createdAt: -1 });

    // Include the purchase count for each best-selling course and sort by purchase count
    const bestSellingCoursesWithCount = bestSellingCourses.map((course) => ({
      ...course.toObject(),
      purchaseCount: courseSalesCount[course._id.toString()],
    })).sort((a, b) => b.purchaseCount - a.purchaseCount);

    res.status(200).json({
      status: true,
      message: "Courses retrieved successfully!",
      BestSellingCourses: bestSellingCoursesWithCount,
      currentPage: page,
      totalPages: Math.ceil(bestSellingCoursesWithCount.length / limit), // Calculate total pages
      totalItems: bestSellingCoursesWithCount.length,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});


