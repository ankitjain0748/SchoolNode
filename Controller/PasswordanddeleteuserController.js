const jwt = require("jsonwebtoken");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { validationErrorResponse, errorResponse, successResponse } = require("../utill/ErrorHandling");
const logger = require("../utill/Loggers");
const VerifyMail = require("../Mail/VerifyMail");

const signEmail = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "120m",
  });
  return token;
};

exports.resetpassword = catchAsync(async (req, res) => {
  try {
    const email = req?.User?._id;
    const { newPassword } = req.body;
    const user = await User.findById({ _id: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password has been reset successfully!" });
  } catch (error) {
    logger.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
});

exports.forgotlinkrecord = catchAsync(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return validationErrorResponse(res, { email: 'Email is required' });
    }
    const record = await User.findOne({ email: email });
    if (!record) {
      return errorResponse(res, "No user found with this email", 404);
    }
    const token = await signEmail(record._id);
    const resetLink = `www.stackearn.com/new-password/${token}`;
    const customerUser = record.name;
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.user,
        pass: process.env.password,
      },
    });
    const emailHtml = VerifyMail(customerUser, resetLink);
    await transporter.sendMail({
      from: process.env.user,
      to: record.email,
      subject: "Forgot Your Password",
      html: emailHtml,
    });
    return successResponse(res, "Email has been sent to your registered email");
  } catch (error) {
    logger.error("Error deleting user record:", error);

    return errorResponse(res, "Failed to send email");
  }
}
);

exports.forgotpassword = catchAsync(async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return successResponse(res, "Password has been successfully reset");
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, "Token has expired. Please generate a new token.", 401);
    }
    logger.error("Error deleting user record:", error);

    return errorResponse(res, "Failed to reset password");
  }
}
);

//delete data

exports.UserIdDelete = catchAsync(async (req, res, next) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required.',
      });
    }
    await User.findByIdAndDelete(Id);

    res.status(200).json({
      status: true,
      data: record,
      message: 'User and associated images deleted successfully.',
    });
  } catch (error) {

    logger.error(error)
    res.status(500).json({
      status: false,
      message: 'Internal Server Error. Please try again later.',
    });
  }
});

exports.UserListIdDelete = catchAsync(async (req, res, next) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }

    const record = await User.findOneAndUpdate(
      { _id: Id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!record) {
      return res.status(404).json({
        status: false,
        message: "User not found or already deleted.",
      });
    }

    res.status(200).json({
      status: true,
      data: record,
      message: "User deleted successfully.",
    });
  } catch (error) {

    logger.error("Error deleting user record:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
});