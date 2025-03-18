const Payment = require("../Model/Payment");
const AdminPays = require("../Model/Adminpay");
const Course = require("../Model/Course");
require('dotenv').config();
const catchAsync = require("../utill/catchAsync");
const Razorpay = require('razorpay');
const logger = require("../utill/Loggers");
const User = require("../Model/User");
const Transaction = require("../Model/Transcation");
const sendEmail = require("../utill/Emailer");
const Purchase = require("../Mail/Purchase")
const AdminPurchase = require("../Mail/AdminPurchase")
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = catchAsync(async (req, res) => {
  const { amount, currency, receipt } = req.body;
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

// 


exports.paymentAdd = catchAsync(async (req, res) => {
  try {
    const UserId = req.User._id;
    const { order_id, payment_id, amount, currency, payment_status, CourseId, payment_method } = req.body;
    const user = await User.findById(UserId);

    if (!order_id || !payment_id || !amount || !CourseId) {
      logger.warn("Missing required fields");
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }
    let referredType = "self"; // Default for direct purchase
    if (user.referred_by) referredType = "direct";
    else if (user.referred_first) referredType = "first";
    else if (user.referred_second) referredType = "second";
    const status = payment_status === "failed" ? "failed" : "success";
    const payment = new Payment({
      order_id,
      currency,
      referred_user_type: referredType,
      payment_id,
      amount,
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
      const subject1 = ` New Course Purchase: ${coursedata.title} by ${user.name} 🎉`;
      if (user) {
        await sendEmail({
          email: user.email,
          name: user.name,
          payment: record,
          cousreData: coursedata.title,
          message: "Your booking request was successful!",
          subject: subject,
          emailTemplate: Purchase,
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
      });
      const { referred_by, referred_first, referred_second } = user;
      const updateReferredUser = async (referredUserId, userKey, amountKey, discountPrice, newUserDiscountPrice) => {
        if (referredUserId) {
          const referredUser = await User.findById(referredUserId).populate("CourseId");
          if (referredUser?.CourseId?.discountPrice <= discountPrice) {
            let applicableDiscountPrice;
            if (userKey === "directuser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.directuser || 0);
            } else if (userKey === "firstuser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.firstuser || 0);
            } else if (userKey === "seconduser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.seconduser || 0);
            }
            await User.findByIdAndUpdate(
              referredUserId,
              { $inc: { [userKey]: 1, [amountKey]: applicableDiscountPrice } },
              { new: true }
            );
            await Payment.updateOne(
              { _id: record._id },
              {
                $set: {
                  referredData: {
                    userId: referredUserId, // Store userId inside referredData
                    [`reffer_${userKey}_pay`]: applicableDiscountPrice, // Store referral amount dynamically
                  },
                },
              }
            );

          } else {
            await Payment.updateOne(
              { _id: record._id },
              {
                $set: {
                  referredData: {
                    userId: referredUserId,
                    [`reffer_${userKey}_pay`]: newUserDiscountPrice,
                  },
                },
              }
            );

            await User.findByIdAndUpdate(
              referredUserId,
              {
                $inc: {
                  [userKey]: 1,
                  ...(discountPrice ? { [amountKey]: newUserDiscountPrice } : {}),
                },
              },
              { new: true }
            );
          }
        }
      }
      // Update referred users based on discount price comparison
      await updateReferredUser(referred_by, "directuser", "referred_user_pay", coursedata.discountPrice, coursedata?.directuser || 0);
      await updateReferredUser(referred_first, "firstuser", "first_user_pay", coursedata.discountPrice, coursedata?.referred_first || 0);
      await updateReferredUser(referred_second, "seconduser", "second_user_pay", coursedata.discountPrice, coursedata?.referred_second || 0);

      // Update the new user's course and status
      const data = await User.findByIdAndUpdate(
        UserId,
        { $set: { CourseId: CourseId, user_status: "Enrolled", ref_date: new Date() } },
        { new: true }
      );


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
    logger.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while saving payment.",
      error: error.message,
    });
  }
});

// exports.paymentAdd = catchAsync(async (req, res) => {
//   try {
//     const UserId = req.User._id;
//     const { order_id, payment_id, amount, currency, payment_status, CourseId, payment_method } = req.body;

//     if (!order_id || !payment_id || !amount || !CourseId) {
//       logger.warn("Missing required fields");
//       return res.status(400).json({ status: false, message: "Missing required fields" });
//     }

//     const status = payment_status === "failed" ? "failed" : "success";
//     const payment = new Payment({
//       order_id,
//       currency,
//       payment_id,
//       amount,
//       payment_status,
//       UserId,
//       status,
//       CourseId,
//       payment_method
//     });

//     const record = await payment.save();
//     const coursedata = await Course.findOne({ _id: CourseId });
//     if (!coursedata) {
//       return res.status(404).json({ status: false, message: "Course not found" });
//     }
//     const user = await User.findById(UserId);

//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     const subject = `Thank You for Your Purchase! ${coursedata.title} is Now Available for You 🎉`;
//     const subject1 = ` New Course Purchase: ${coursedata.title} by ${user.name} 🎉`;

//     if (user) {
//       await sendEmail({
//         email: user.email,
//         name: user.name,
//         payment: record,
//         cousreData: coursedata.title,
//         message: "Your booking request was successful!",
//         subject: subject,
//         emailTemplate: Purchase,
//       });
//     }
//     await sendEmail({
//       email: "sainibhim133@gmail.com",
//       name: "Admin",
//       datauser: user,
//       payment: record,
//       cousreData: coursedata.title,
//       message: "Your booking request was successful!",
//       subject: subject1,
//       emailTemplate: AdminPurchase,
//     });

//     if (payment_status === "success") {
//       const { referred_by, referred_first, referred_second, referred_user_pay_daily } = user;

//       // Helper function to update referred users
//       const updateReferredUser = async (referredUserId, userKey, amountKey, discountPrice, newUserDiscountPrice) => {
//         if (referredUserId) {
//           const referredUser = await User.findById(referredUserId).populate("CourseId");
//           if (referredUser?.CourseId?.discountPrice < discountPrice) {
//             let applicableDiscountPrice;
//             if (userKey === "directuser") {
//               applicableDiscountPrice = Math.min(referredUser?.CourseId?.directuser || 0);
//             } else if (userKey === "firstuser") {
//               applicableDiscountPrice = Math.min(referredUser?.CourseId?.firstuser || 0);
//             } else if (userKey === "seconduser") {
//               applicableDiscountPrice = Math.min(referredUser?.CourseId?.seconduser || 0);
//             }
//             await User.findByIdAndUpdate(
//               referredUserId,
//               { $inc: { [userKey]: 1, [amountKey]: applicableDiscountPrice } },
//               { new: true }
//             );
//           }
//         } else {
//           await User.findByIdAndUpdate(
//             referredUserId,
//             { $inc: { [userKey]: 1, [amountKey]: discountPrice ? newUserDiscountPrice : null } },
//             { new: true }
//           );
//         }
//       };

//       const updateReferredUserPayDaily = async (userId, coursedata) => {
//         const user = await User.findById(userId).populate("CourseId");

//         // Ensure that we're accumulating all referred user's daily pay
//         let totalReferredUserPayDaily = 0;

//         // Add current user's referred pay daily (if available)
//         totalReferredUserPayDaily += (user.referred_user_pay_daily || 0);

//         // Add the direct, first, and second referred user's daily pay from the course data
//         totalReferredUserPayDaily += (coursedata.directuser || 0) + (coursedata?.referred_first || 0) + (coursedata?.referred_second || 0);

//         // Update the referred_user_pay_daily for the current user
//         await User.findByIdAndUpdate(
//           userId,
//           { $set: { referred_user_pay_daily: totalReferredUserPayDaily } },
//           { new: true }
//         );

//         return totalReferredUserPayDaily;
//       };

//       // Main logic
//       let totalReferredUserPayDaily = await updateReferredUserPayDaily(UserId, coursedata);


//       if (referred_by) {
//         totalReferredUserPayDaily = await updateReferredUserPayDaily(referred_by, coursedata);
//       }

//       if (referred_first) {
//         totalReferredUserPayDaily = await updateReferredUserPayDaily(referred_first, coursedata);
//       }

//       if (referred_second) {
//         totalReferredUserPayDaily = await updateReferredUserPayDaily(referred_second, coursedata);
//       }


//       // Update the new user's course and status
//       const data = await User.findByIdAndUpdate(
//         UserId,
//         { $set: { CourseId: CourseId, user_status: "Enrolled", ref_date: new Date() } },
//         { new: true }
//       );

//       return res.status(200).json({
//         status: "success",
//         message: "Payment verified and saved successfully",
//         data,
//       });
//     }

//     if (payment_status === "failed") {
//       return res.status(200).json({
//         status: "failed",
//         message: "Payment failed and saved successfully",
//       });
//     }
//   } catch (error) {
//     logger.error(error);
//     res.status(500).json({
//       status: false,
//       message: "An error occurred while saving payment.",
//       error: error.message,
//     });
//   }
// });


exports.PaymentGet = catchAsync(async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;

    const selectoption = req.query.selectedOption ? String(req.query.selectedOption).trim() : "";
    const search = req.query.search ? String(req.query.search).trim() : "";

    let query = {};

    // Search by payment ID or user's name
    if (search) {
      // Correct filter for direct userId reference:
      const users = await User.find({ name: { $regex: search, $options: "i" } }, '_id'); //get all user id match with search query
      const userIds = users.map(user => user._id);
      filter.userId = { $in: userIds }; // Filter by user IDs

    }

    if (selectoption) {
      query.payment_status = selectoption;
    }

    const totalUsers = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    const payment = await Payment.find(query)
      .populate("UserId")
      .populate("CourseId")
      .skip(skip)
      .limit(limit);

    if (!payment || payment.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        payment: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "Payment retrieved successfully!",
      payment: payment,
      totalUsers,
      totalPages,
      currentPage: page,
      perPage: limit,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
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
    const CourseIds = UserPayments.map((payment) => payment.CourseId);
    const courses = await Course.find({ _id: { $in: CourseIds } }).populate("InstrutorId");
    res.status(200).json({
      status: true,
      message: "Courses retrieved successfully!",
      Payments: UserPayments,
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
    const limit = Math.max(parseInt(req.query.limit) || 15, 1); // Use the provided limit or a reasonable default (15)
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search ? req.query.search.trim() : ""; // Corrected typo: serach to search
    const selectoption = req.query.selectedOption ? String(req.query.selectedOption).trim() : "";
    const filter = {};

    if (searchQuery) {
      // Correct filter for direct userId reference:
      const users = await User.find({ name: { $regex: searchQuery, $options: "i" } }, '_id'); //get all user id match with search query
      const userIds = users.map(user => user._id);
      filter.userId = { $in: userIds }; // Filter by user IDs

    }


    if (selectoption) {
      filter.page = selectoption;
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

    // Improved empty result handling:  Return consistent structure
    if (payment.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No payments found.", // Clearer message
        payment: [],
        totalUsers: 0,
        totalPages: 0,
        currentPage: page,
        perPage: limit,
        nextPage: null,
        previousPage: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "Payments retrieved successfully!",
      payment, // Shorthand for payment: payment
      totalUsers,
      totalPages,
      currentPage: page,
      perPage: limit,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    });

  } catch (err) {
    logger.error(err); // Keep logging the error for debugging
    res.status(500).json({
      status: false,
      message: "An error occurred. Please try again later.", // User-friendly message
      // error: err.message,  // Remove in production for security!  Don't expose internal errors.
    });
  }
});

exports.paymentdata = catchAsync(async (req, res) => {
  try {
    const userId = req.User?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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

    const bestSellingCourses = await Course.find({ _id: { $in: bestSellingCourseIds } }).populate("InstrutorId");

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


