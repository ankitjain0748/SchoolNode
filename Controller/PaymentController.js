const Payment = require("../Model/Payment");
const AdminPays = require("../Model/Adminpay");
const Course = require("../Model/Course");
require('dotenv').config();
const catchAsync = require("../utill/catchAsync");
const Razorpay = require('razorpay');
const logger = require("../utill/Loggers");
const User = require("../Model/User");

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

exports.paymentAdd = catchAsync(async (req, res) => {
  try {
    const UserId = req.User._id;
    const { order_id, payment_id, amount, currency, payment_status, CourseId } = req.body;

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
      payment_status,
      UserId,
      status,
      CourseId,
    });

    await payment.save();

    const coursedata = await Course.findOne({ _id: CourseId });
    if (!coursedata) {
      return res.status(404).json({ status: false, message: "Course not found" });
    }

    if (payment_status === "success") {
      const user = await User.findById(UserId);

      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }

      const { referred_by, referred_first, referred_second } = user;

      // Helper function to update referred users
      const updateReferredUser = async (referredUserId, userKey, amountKey, discountPrice, newUserDiscountPrice) => {
       console.log("? newUserDiscountPrice :null" , discountPrice , newUserDiscountPrice ,userKey)
        if (referredUserId) {
          const referredUser = await User.findById(referredUserId).populate("CourseId");
          console.log("referredUser",referredUser)
          if (referredUser?.CourseId?.discountPrice < discountPrice) {
            let applicableDiscountPrice;
            if (userKey === "directuser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.directuser || 0);
            } else if (userKey === "firstuser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.firstuser || 0 );
            } else if (userKey === "seconduser") {
              applicableDiscountPrice = Math.min(referredUser?.CourseId?.seconduser || 0);
            }
            await User.findByIdAndUpdate(
              referredUserId,
              { $inc: { [userKey]: 1, [amountKey]: applicableDiscountPrice } },
              { new: true }
            );
          }
          } else {
            await User.findByIdAndUpdate(
              referredUserId,
              { $inc: { [userKey]: 1, [amountKey]: discountPrice ? newUserDiscountPrice :null } },
              { new: true }
            );
          }
        }
  // Update referred users based on discount price comparison
  await updateReferredUser(referred_by, "directuser", "referred_user_pay", coursedata.discountPrice ,coursedata?.directuser || 0 );
  await updateReferredUser(referred_first, "firstuser", "first_user_pay", coursedata.discountPrice , coursedata?.referred_first || 0);
  await updateReferredUser(referred_second, "seconduser", "second_user_pay",coursedata.discountPrice ,coursedata?.referred_second || 0);
   
  // Update the new user's course and status
      const data = await User.findByIdAndUpdate(
        UserId,
        { $set: { CourseId: CourseId, user_status: "Enrolled" , ref_date :new Date() } },
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
        message: "Payment failed and saved successfully",
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
//     const { order_id, payment_id, amount, currency, payment_status, CourseId } = req.body;

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
//     });

//     await payment.save();

//     const coursedata = await Course.findOne({
//       _id: CourseId

//     })


//     if (payment_status === "success") {
//       const user = await User.findById(UserId);

//       if (!user) {
//         return res.status(404).json({ status: false, message: "User not found" });
//       }

//       const { referred_by, referred_first, referred_second } = user;
//       if (referred_by) {
//         await User.findByIdAndUpdate(
//           referred_by,
//           {
//             $inc: { directuser: 1, referred_user_pay: coursedata?.directuser },
//           },
//           { new: true }
//         );
//       }

//       if (referred_first) {
//         await User.findByIdAndUpdate(
//           referred_first,
//           {
//             $inc: { firstuser: 1, first_user_pay: coursedata?.firstuser },
//           },
//           { new: true }
//         );
//       }

//       if (referred_second) {
//         await User.findByIdAndUpdate(
//           referred_second,
//           {
//             $inc: { seconduser: 1, second_user_pay: coursedata?.seconduser },
//           },
//           { new: true }
//         );
//       }
//       const data = await User.findByIdAndUpdate(
//         UserId,
//         {
//           $set: { CourseId: CourseId, user_status: "Enrolled" },
//         },
//         { new: true }
//       );
//       return res.status(200).json({ status: "success", message: "Payment verified and saved successfully" });
//     }

//     if (payment_status === "failed") {
//       return res.status(200).json({ status: "failed", message: "Payment failed and saved successfully" });
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
    const payment = await Payment.find({}).populate("UserId").populate("CourseId");
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
    const UserPayments = await Payment.find({ UserId, payment_status: "success" }).populate("UserId").populate("CourseId");
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
    
    const payment = await AdminPays.find({}).populate({
       path: "userId",
      select: "name phone_number phone_code email"} );
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

exports.paymentdata= catchAsync(async (req,res)=>{
  try {
    const userId = req.User?._id 
    const payment = await AdminPays.find({userId});
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
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
})