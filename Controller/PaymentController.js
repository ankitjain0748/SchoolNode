const Payment = require("../Model/Payment");
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
    let _id = UserId;
    if (payment_status === "success") {

      const userUpdate = await User.findByIdAndUpdate(
        _id,
        {
          $set: { CourseId: CourseId },
        },
        { new: true } 
      );
    }

    if (payment_status === "failed") {
      return res.status(200).json({ status: "failed", message: "Payment failed and saved successfully" });
    } else {
      return res.status(200).json({ status: "success", message: "Payment verified and saved successfully" });
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
