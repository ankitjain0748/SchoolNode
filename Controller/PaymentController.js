require('dotenv').config(); 
const Payment = require("../Model/Payment");
const catchAsync = require("../utill/catchAsync");
const Razorpay = require('razorpay');
  
  console.log('Razorpay Key:', process.env.RAZORPAY_KEY_ID);
  console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET);
  
  const razorpayInstance = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  exports.createOrder = catchAsync(
    async (req, res) => {
      const { amount, currency = 'INR', receipt } = req.body;
    
      try {
        if (!amount || !receipt) {
          return res.status(400).json({ success: false, message: 'Amount and Receipt are required' });
        }
    
        const options = {
          amount: amount, // Amount in paise
          currency,
          receipt,
          payment_capture: 1,
        };
        console.log("order",razorpayInstance)
    
        const order = await razorpayInstance.orders.create(options);
  
        res.status(200).json({
          success: true,
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
        });
      } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, message: 'Order creation failed', error: error.message });
      }
    }
  )
  
  
  
  


exports.paymentAdd = catchAsync(async (req, res) => {
  console.log("req", req?.body);
  const UserId = req?.User?._id
  const { order_id, payment_id, amount, currency, payment_status, product_name, type } = req.body;
  const status = payment_status === 'failed' ? 'failed' : 'success';
  const payment = new Payment({
    order_id: order_id,
    currency: currency,
    payment_id: payment_id,
    amount: amount,
    payment_status: payment_status,
    product_name,
    type,
    UserId: UserId,
    status: status,
  });

  await payment.save();
  if (payment_status === 'failed') {
    return res.status(200).json({ status: 'failed', message: 'Payment failed and saved successfully' });
  } else {
    return res.status(200).json({ status: 'success', message: 'Payment verified and saved successfully' });
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
    console.error("Error retrieving payments:", err.message);
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});