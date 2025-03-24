const jwt = require("jsonwebtoken");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const Adminpayment = require("../Model/Adminpay");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const VerifyAccount = require("../Mail/VerifyAccount")
const { validationErrorResponse, errorResponse, successResponse } = require("../utill/ErrorHandling");
const ProfileData = require("../Model/Profile");
const logger = require("../utill/Loggers");
const { default: mongoose } = require("mongoose");
const Bank = require("../Model/Bank");
const TempUser = require("../Model/TempUser");
const SocialSection = require("../Model/Social");
const RegisterEmail = require("../Mail/RegisterEmail");
const AdminEmail = require("../Mail/AdminRegister");
const sendEmail = require("../utill/Emailer");
const Payout = require("../Mail/Payout");
const VerifyMail = require("../Mail/VerifyMail");
const moment = require('moment');
const cron = require("node-cron");
exports.verifyToken = async (req, res, next) => {
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    let token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "User is not authorized",
      });
    } else {
      try {
        const decode = await promisify(jwt.verify)(
          token,
          process.env.JWT_SECRET_KEY
        );
        if (decode) {
          let result = await User.findById({ _id: decode.id });
          if (result) {
            req.User = result;
            next();
          } else {
            return res.status(404).json({
              status: false,
              message: "User not found",
            });
          }
        } else {
          return res.status(401).json({
            status: false,
            message: "Unauthorized",
          });
        }
      } catch (err) {
        return res.status(401).json({
          status: false,
          message: "Invalid or expired token",
          error: err,
        });
      }
    }
  } else {
    return res.status(400).json({
      status: false,
      message: "User is not authorized or Token is missing",
    });
  }
};

const signToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "14400m",
  });
  return token;
};

const signEmail = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "120m",
  });
  return token;
};
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

exports.isValidEmail = (email) => { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email); };

exports.OTP = catchAsync(async (req, res) => {
  try {
    const { email, password, name, phone_number, referred_by, Email_verify, referral_code } = req.body;
    const existingTempUser = await TempUser.findOne({ $or: [{ email }, { phone_number }] });
    if (existingTempUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone number is already in process!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000); 

    let referrer = null;
    if (referred_by) {
      referrer = await User.findOne({ referral_code: referred_by });
      if (!referrer) {
        return res.status(400).json({
          status: false,
          message: "Invalid referral code",
        });
      }
    }

    let referrers = null;
    if (referrer?.referred_by) {
      try {
        const referrerObjectId = new mongoose.Types.ObjectId(referrer.referred_by);
        referrers = await User.findOne({ _id: referrerObjectId });
        if (!referrers) {
          return res.status(400).json({
            status: false,
            message: "Invalid second referral code",
          });
        }
      } catch (error) {
        return res.status(400).json({
          status: false,
          message: "Invalid ObjectId format",
        });
      }
    }

    let referrerdata = null;
    if (referrers?.referred_by) {
      const referrerObjectId = new mongoose.Types.ObjectId(referrers.referred_by);
      referrerdata = await User.findOne({ _id: referrerObjectId });
      if (!referrerdata) {
        return res.status(400).json({
          status: false,
          message: "Invalid referral code",
        });
      }
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone number is already in use!",
      });
    }
    const tempUser = {
      email,
      password: hashedPassword,
      name,
      phone_number,
      referred_by: referrer ? referrer._id : null,
      referred_first: referrers ? referrers._id : null,
      referred_second: referrerdata ? referrerdata._id : null,
      OTP: otp,
      Email_verify: Email_verify,
      otpExpiry:otpExpiry,
      referral_code: referral_code,
    };

    await TempUser.create(tempUser);
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: process.env.MAIL_PORT === '465',
      auth: {
        user: process.env.user,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const emailHtml = VerifyAccount(otp, name);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "StackEarn - Verify your Account",
      html: emailHtml,
    });

    return res.status(201).json({
      status: true,
      message: "OTP has been sent to your email!",
    });

  } catch (error) {
    return res.status(500).json({
      error,
      message: "Internal Server Error",
    });
  }
});

const deleteExpiredOTPs = async () => {
  try {
    const now = new Date();
    const result = await TempUser.deleteMany({ otpExpiry: { $lt: now } });
    console.log("result" , result)
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired OTP users.`);
    }
  } catch (error) {
    console.error("Error deleting expired OTP users:", error);
  }
};

cron.schedule("*/3 * * * *", async () => {
  console.log("Running OTP cleanup job...");
  await deleteExpiredOTPs();
});

exports.VerifyOtp = catchAsync(async (req, res, next) => {
  try {
    const { email, OTP } = req.body;
    if (!email || !OTP) {
      return res.status(401).json({
        status: false,
        message: "Email and OTP are required!",
      });
    }

    // Find the temporary user by email
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(401).json({
        status: false,
        message: "Invalid Email or OTP",
      });
    }

    if (tempUser.OTP != OTP) {
      return res.status(401).json({
        status: false,
        message: "Invalid OTP",
      });
    }

    // Move user from temporary collection to main User collection
    const newUser = new User({
      email: tempUser.email,
      password: tempUser.password,
      name: tempUser.name,
      phone_number: tempUser.phone_number,
      referred_by: tempUser.referred_by,
      referred_first: tempUser.referred_first,
      referred_second: tempUser.referred_second,
      Email_verify: tempUser?.Email_verify,
    });
    if (tempUser.referred_by) {
      await User.findByIdAndUpdate(tempUser.referred_by, {
        $addToSet: { referrals: newUser._id },
      });
    }
    if (tempUser.referred_first) {
      await User.findByIdAndUpdate(tempUser.referred_first, {
        $addToSet: { referrals: newUser._id },
      });
    }
    if (tempUser.referred_second) {
      await User.findByIdAndUpdate(tempUser.referred_second, {
        $addToSet: { referrals: newUser._id },
      });
    }

    await TempUser.deleteOne({ email });
    await newUser.save();

    const token = await signToken(newUser._id);
    res.json({
      status: true,
      message: "Your account has been verified.",
      token,
    });
    const subject = "Welcome to Stackearn - Registration Successful! 🎉";
    const subject1 = ` New User Registration ${newUser.name} 🎉`;
    if (newUser) {
      await sendEmail({
        email: newUser.email,
        name: newUser.name,
        Webniarrecord: newUser,
        message: "Your booking request was successful!",
        subject: subject,
        emailTemplate: RegisterEmail,
      });
    }
    await sendEmail({
      email: "ankitkumarjain0748@gmail.com",
      name: "Admin",
      datauser: newUser,
      message: "Your booking request was successful!",
      subject: subject1,
      emailTemplate: AdminEmail,
    });



  } catch (error) {
    return res.status(500).json({
      error,
      message: "An unknown error occurred. Please try later.",
    });
  }
});

exports.signup = catchAsync(async (req, res) => {
  try {
    const { email, password, name, phone_number, referred_by } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors = "Email is already in use!";
      }
      if (existingUser.phone_number === phone_number) {
        errors = "Phone number is already in use!";
      }
      return res.status(400).json({
        status: false,
        message: errors,
        errors,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate and handle referral
    let referrer = null, referrers = null, referrerdata = null;
    if (referred_by) {
      referrer = await User.findOne({ referral_code: referred_by });
      if (!referrer) {
        return res.status(400).json({
          status: false,
          message: "Invalid referral code",
        });
      }

      if (referrer.referred_by) {
        const referrerObjectId = new mongoose.Types.ObjectId(referrer.referred_by);
        referrers = await User.findOne({ _id: referrerObjectId });
        if (!referrers) {
          return res.status(400).json({
            status: false,
            message: "Invalid second referral code",
          });
        }

        if (referrers.referred_by) {
          const referrerObjectId = new mongoose.Types.ObjectId(referrers.referred_by);
          referrerdata = await User.findOne({ _id: referrerObjectId });
          if (!referrerdata) {
            return res.status(400).json({
              status: false,
              message: "Invalid referral code",
            });
          }
        }
      }
    }

    // Create new user with referral data
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone_number,
      referred_by: referrer?._id || null,
      referred_second: referrers?._id || null,
      referred_first: referrerdata?._id || null,
    });

    const result = await newUser.save();

    const updateReferralData = async (userId) => {
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { referrals: result._id }, // Add the new user ID to the referrals array
          $addToSet: { ref_date: new Date() }, // Update the referral date
        });
      }
    };

    await updateReferralData(referrer?._id);      // Update for the first-level referrer
    await updateReferralData(referrers?._id);    // Update for the second-level referrer
    await updateReferralData(referrerdata?._id); // Update for the third-level referrer


    return successResponse(res, "You have been registered successfully!", 201, {
      userId: result._id,
    });
  } catch (error) {
    logger.error("Error during signup:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      logger.warn("Email and password are required!")
      return res.status(401).json({
        status: false,
        message: "Email and password are required!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid Email or password!")
      return res.status(401).json({
        status: false,
        message: "Invalid Email or password",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn("Incorrect password!")
      return res.status(400).json({
        status: false,
        message: "Incorrect password. Please try again.",
      });
    }

    // Check if the user account is inactive
    // if (user.user_status === "inactive") {
    //   logger.warn("Your account is inactive. Please contact support.")
    //   return res.status(403).json({
    //     status: false,
    //     message: "Your account is inactive. Please contact support.",
    //   });
    // }

    // Validate user role
    if (user.role !== role) {
      logger.warn("Access denied. Only user can log in.")
      return res.status(403).json({
        status: false,
        message: "Access denied. Only user can log in.",
      });
    }

    // Generate a token for the user
    const token = await signToken(user._id);
    res.json({
      status: true,
      message: "Login Successfully!",
      token,
    });
  } catch (error) {
    logger.error("Error fetching booking:", error);
    return res.status(500).json({
      error,
      message: "An unknown error occurred. Please try later.",
    });
  }
});

exports.profile = catchAsync(async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 50, 1);
    const skip = (page - 1) * limit;
    const selectoption = req.query.selectedoption ? String(req.query.selectedoption).trim() : ""; // Assuming you'll use this later
    const search = req.query.search ? String(req.query.search).trim() : "";
    let query = { role: "user", isDeleted: false };

    if (search !== "") {
      query.name = { $regex: new RegExp(search, "i") };
    }
    if (selectoption) {
      query.user_status = selectoption; // Assuming 'valid' means verified
    }

    const users = await User.find(query)
      .populate("CourseId")
      .select("-password")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch bank and profile details in parallel for all users
    const bankDetails = await Bank.find({ userId: { $in: users.map(user => user._id) } }).select("-_id -userId");
    const profileDetails = await ProfileData.find({ userId: { $in: users.map(user => user._id) } }).select("-_id -userId");


    // Map the users with their bank and profile details
    const usersWithBankDetails = users.map(user => {
      // Bank detail safely fetch karein

      const bankDetail = bankDetails.find(bank => String(bank?.userId) === String(user?._id));
      const profileDetail = profileDetails.find(profile => String(profile?.userId) === String(user?._id));

      return {
        ...user.toObject(),
        bank_details: bankDetail,
        ProfileDetails: profileDetail
      };
    });


    // Total users and pagination details
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    // Return response
    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully with bank details",
      data: {
        users: usersWithBankDetails,
        totalUsers,
        totalPages,
        currentPage: page,
        perPage: limit,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    logger.error("Error fetching users:", error);

    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching users and updating bank details.",
      error: error.message || "Internal Server Error", // Provide a fallback error message
    });
  }
});

exports.updateUserStatus = catchAsync(async (req, res) => {
  try {
    const { _id, user_status } = req.body;
    if (!_id || !user_status) {
      return res.status(400).json({
        message: "User ID and status are required.",
        status: false,
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    const newStatus = user.user_status === "active" ? "inactive" : "active";
    user.user_status = newStatus;
    await user.save();

    res.status(200).json({
      message: `User status updated to ${user?.user_status}`,
      status: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error fetching booking:", error);

    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
});

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

exports.UserUpdate = catchAsync(async (req, res, next) => {
  try {
    const { Id, email, username, address, phone_number, city } = req.body;
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }
    const updatedRecord = await User.findByIdAndUpdate(
      Id,
      { email, username, address, phone_number, city },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      status: true,
      data: updatedRecord,
      message: "User updated successfully.",
    });
  } catch (error) {
    logger.error("Error deleting user record:", error);

    res.status(500).json({
      status: false,
      message:
        "An error occurred while updating the User. Please try again later.",
      error: error.message,
    });
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

exports.profilegettoken = catchAsync(async (req, res, next) => {
  try {
    // Ensure req.User is populated properly from middleware
    const userId = req?.User?._id;
    if (!userId) {
      return res.status(400).json({ msg: "User not authenticated" });
    }

    // Fetch user profile excluding password
    const userProfile = await User.findById(userId).select('-password');
    if (!userProfile) {
      return res.status(404).json({ msg: "User profile not found" });
    }

    // Fetch additional profile data by userId
    const profileData = await ProfileData.findOne({ userId });
    // Respond with data
    res.status(200).json({
      data: userProfile,
      profileData: profileData,
      msg: "Profile retrieved successfully",
    });
  } catch (error) {
    logger.error("Error deleting user record:", error);

    res.status(500).json({
      msg: "Failed to fetch profile",
      error: error.message,
    });
  }
});

exports.userfilter = catchAsync(async (req, res, next) => {
  try {
    const { username, user_status } = req.body;  // Changed to req.query for query params
    let filter = {};

    if (user_status) {
      filter.user_status = user_status;
    }

    if (username) {
      filter.username = { $regex: `^${username}$`, $options: 'i' };
    }

    const users = await User.find(filter).select("-password");

    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    logger.error("Error deleting user record:", error);

    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching users.",
      error: error.message,
    });
  }
});
exports.VerifyUser = catchAsync(
  async (req, res) => {
    try {
      const { token } = req.body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.id);
      if (!user) {
        return errorResponse(res, "User not found", 404);
      }
      user.verified = true;
      await user.save();
      return successResponse(res, "Password has been successfully reset");
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, "Token has expired. Please contact support.", 401);
      }
      logger.error("Error deleting user record:", error);
      return errorResponse(res, "Failed to verify account");
    }
  }
);

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

exports.paymentdata = catchAsync(async (req, res) => {
  try {
    const {
      Id, data_payment, success_reasons, payment_type, paymentMethod,
      payment_reason, transactionId, payment_data, payment_income,
      referred_user_pay, payment_key, page, withdrawal_reason,
      paymentWidthrawal, payment_Add
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

    // Reset values when period changes
    if (user.lastPaymentMonth !== currentMonth) updatedReferredUserPayMonthly = 0;
    if (user.lastPaymentWeek !== currentWeek) updatedReferredUserPayWeekly = 0;

    if (user.lastPaymentDay !== currentDay) {
      updatedLastTodayIncome = updatedReferredUserPayDaily; // Save today's income to lastTodayIncome
      updatedReferredUserPayDaily = 0;
      updatedPaymentKey = 0;
    }

    // Add current payments
    const referralAmount = Number(payment_Add) || 0;
    updatedReferredUserPayOverall += referralAmount;
    updatedReferredUserPayMonthly += referralAmount;
    updatedReferredUserPayWeekly += referralAmount;
    updatedReferredUserPayDaily += referralAmount;
    updatedPaymentKey += Number(paymentWidthrawal) || 0;

    const newPayment = new Adminpayment({
      userId: Id, paymentMethod, payment_type, success_reasons,
      paymentWidthrawal, payment_reason, withdrawal_reason, payment_key,
      transactionId, payment_data, payment_income, data_payment, page,
      referred_user_pay, payment_Add
    });

    const paymentRecord = await newPayment.save();
    if (!paymentRecord) {
      return res.status(400).json({
        status: false,
        message: "Failed to save payment data."
      });
    }

    // Update user payment data
    const updatedUser = await User.findByIdAndUpdate(
      Id,
      {
        payment_Add, payment_data, referred_user_pay,
        referred_user_pay_overall: updatedReferredUserPayOverall,
        referred_user_pay_monthly: updatedReferredUserPayMonthly,
        referred_user_pay_weekly: updatedReferredUserPayWeekly,
        referred_user_pay_daily: updatedReferredUserPayDaily,
        lastTodayIncome: updatedLastTodayIncome,
        lastPaymentMonth: currentMonth,
        lastPaymentWeek: currentWeek,
        payment_key: payment_key,
        lastPaymentDay: currentDay,
        payment_key_daily: updatedPaymentKey,
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
      await sendEmail({
        email: updatedUser.email,
        name: updatedUser.name,
        Webniarrecord: paymentRecord,
        subject: subject1,
        emailTemplate: Payout,
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

// Let me know if you want me to make any adjustments or add more features! 🚀
exports.UserPriceUpdate = catchAsync(async (req, res, next) => {
  try {
    const UserId = req?.User?._id
    const { price, percentage } = req.body;
    if (!UserId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }
    const updatedRecord = await User.findByIdAndUpdate(
      UserId,
      { ActiveUserPrice: price, InActiveUserPercanetage: percentage, },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        status: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      status: true,
      data: updatedRecord,
      message: "User updated successfully.",
    });
  } catch (error) {
    logger.error("Error deleting user record:", error);

    res.status(500).json({
      status: false,
      message:
        "An error occurred while updating the User. Please try again later.",
      error: error.message,
    });
  }
});

exports.getUsersWithTodayRefDate = catchAsync(async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {
      role: 'user', // Adding filter for users with role 'user'
      lastTodayIncome: { $gt: 0 } // Adding filter for lastTodayIncome greater than 0
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate());
    startDate.setHours(0, 0, 0, 0);
    const formattedDate = startDate.toISOString().split("T")[0];

    if (search && search.trim() !== "") {
      query.name = { $regex: search, $options: "i" }; // Search query for name
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch users based on the query, with pagination
    const users = await User.find(query).skip(skip).limit(limitNumber);

    // Fetch additional user details
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const [referredBy, referredFirst, referredSecond, userBankDetails] = await Promise.all([
          user.referred_by ? User.findById(user.referred_by).select("-password") : null,
          user.referred_first ? User.findById(user.referred_first).select("-password") : null,
          user.referred_second ? User.findById(user.referred_second).select("-password") : null,
          Bank.findOne({ userId: user._id }),
        ]);

        const [referredByBankDetails, referredByProfileDetails, referredFirstBankDetails, referredSecondBankDetails] = await Promise.all([
          referredBy ? Bank.findOne({ userId: referredBy._id }) : null,
          referredBy ? ProfileData.findOne({ userId: referredBy._id }) : null,
          referredFirst ? Bank.findOne({ userId: referredFirst._id }) : null,
          referredSecond ? Bank.findOne({ userId: referredSecond._id }) : null,
        ]);

        return {
          ...user.toObject(),
          referred_by_details: referredBy,
          referred_first_details: referredFirst,
          referred_second_details: referredSecond,
          bank_details: userBankDetails,
          referred_by_bank_details: referredByBankDetails,
          referred_first_bank_details: referredFirstBankDetails,
          referred_second_bank_details: referredSecondBankDetails,
          referredByProfileDetails,
        };
      })
    );

    const totalUsers = await User.countDocuments(query); // Get total users count with filters

    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      userDetails: userDetails,
      totalUsers,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalUsers / limitNumber),
      limit: limitNumber,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching users",
      error: err.message,
    });
  }
});

exports.UserListIds = catchAsync(async (req, res, next) => {
  try {
    const userId = req.User._id;
    const ProfileDetails = await ProfileData.findOne({ userId }).populate("userId");
    // Return response
    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully with bank details",
      data: ProfileDetails,
    });
  } catch (error) {
    logger.error("Error fetching users:", error);

    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching users and updating bank details.",
      error: error.message || "Internal Server Error",
    });
  }
});