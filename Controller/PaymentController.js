const Payment = require("../Model/Payment");
const Course = require("../Model/Course");
require('dotenv').config();
const catchAsync = require("../utill/catchAsync");
const Razorpay = require('razorpay');
const logger = require("../utill/Loggers");


const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = catchAsync(async (req, res) => {
  console.log("req.body", req.body)
  const { amount, currency, receipt } = req.body;
  try {
    const options = {
      amount: amount * 100, // Convert to smallest currency unit (e.g., paise)
      currency,
      receipt,
      payment_capture: 1, // Auto-capture payments
    };

    logger.info('Creating Razorpay order with options:', options);
    console.log("options0", options)
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
    console.log("Received request body:", req.body); // Log the request body
    const UserId = req.User._id;
    const { order_id, payment_id, amount, currency, payment_status, CourseId } = req.body;

    if (!order_id || !payment_id || !amount || !CourseId) {
      return res.status(400).json({ status: false, message: "Missing required fields" });
    }

    const status = payment_status === 'failed' ? 'failed' : 'success';
    const payment = new Payment({
      order_id: order_id,
      currency: currency,
      payment_id: payment_id,
      amount: amount,
      payment_status: payment_status,
      UserId: UserId,
      status: status,
      CourseId: CourseId
    });

    await payment.save();
    if (payment_status === 'failed') {
      return res.status(200).json({ status: 'failed', message: 'Payment failed and saved successfully' });
    } else {
      return res.status(200).json({ status: 'success', message: 'Payment verified and saved successfully' });
    }
  } catch (error) {
    logger.error(error);
    res.json({
      status: false,
      message: "An error occurred while saving payment.",
      error: error.message,
    });
  }
});



exports.PaymentGet = catchAsync(async (req, res, next) => {
  try {
    const payment = await Payment.find({}).sort({ payment_date: -1 });
    if (!payment || payment.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        Payment: [],
      });
    }
    res.status(200).json({
      status: true,
      message: "Payment retrieved successfully!",
      Payment: payment,
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
    const UserPayments = await Payment.find({ UserId, payment_status :"success" });
    if (!UserPayments || UserPayments.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No Payment found for this user.",
        Payments: [],
      });
    }
    const CourseIds = UserPayments.map((payment) => payment.CourseId);
    const courses = await Course.find({ _id: { $in: CourseIds } });
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
