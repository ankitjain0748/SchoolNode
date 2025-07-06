const jwt = require("jsonwebtoken");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const VerifyAccount = require("../Mail/VerifyAccount")
const { errorResponse, successResponse } = require("../utill/ErrorHandling");
const ProfileData = require("../Model/Profile");
const logger = require("../utill/Loggers");
const { default: mongoose } = require("mongoose");
const Bank = require("../Model/Bank");
const TempUser = require("../Model/TempUser");
const RegisterEmail = require("../Mail/RegisterEmail");
const AdminEmail = require("../Mail/AdminRegister");
const sendEmail = require("../utill/Emailer");

const signToken = async (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "14400m",
  });
  return token;
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

exports.isValidEmail = (email) => { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email); };

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

exports.OTP = catchAsync(async (req, res) => {
  try {
    const { email, password, name, phone_number, referred_by, Email_verify, referral_code } = req.body;
    const existingTempUser = await TempUser.findOne({ $or: [{ email }, { phone_number }] });

    if (existingTempUser) {
      await TempUser.deleteOne({ _id: existingTempUser._id });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
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
      let errors = "Email or Phone number already Exist ";
      if (existingUser.email === email) {
        errors = "Email is already Exist!";
      }
      else {
        errors = "Phone number is already Exist!";
      }
      return res.status(400).json({
        status: false,
        message: errors,
        errors,
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
      referral_code: referral_code,
    };

    const record = await TempUser.create(tempUser);
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: false,
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
      from: "StackEarn Support <no-reply@stackearn.com>",
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

exports.ReSendOtp = catchAsync(async (req, res) => {
  try {
    const { email } = req.body;
    const existingTempUser = await TempUser.findOne({ email: email });
    if (existingTempUser) {
      const otp = generateOTP();
      const recros = await TempUser.findByIdAndUpdate(
        existingTempUser._id,
        { OTP: otp },
        { new: true }
      );
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT, 10),
        secure: false,
        auth: {
          user: process.env.user,
          pass: process.env.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const emailHtml = VerifyAccount(otp, recros.name);
      await transporter.sendMail({
        from: "StackEarn Support <no-reply@stackearn.com>",
        to: email,
        subject: "StackEarn - Verify your Account",
        html: emailHtml,
      });

      return res.status(200).json({ // 200 OK, update successful
        status: true,
        message: "New OTP has been sent to your email!",
      });
    }



    return res.status(201).json({
      status: true,
      message: "OTP Resend has been sent to your email!",
    });
  } catch (error) {
    console.log("error", error)
    return res.status(500).json({
      error,
      message: "Internal Server Error",
    });
  }
});

exports.VerifyOtp = catchAsync(async (req, res, next) => {
  try {
    const { email, OTP } = req.body;
    if (!email || !OTP) {
      return res.status(401).json({
        status: false,
        message: "OTP are required!",
      });
    }

    // Find the temporary user by email
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(401).json({
        status: false,
        message: "Invalid OTP",
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
      message: "Account created successfully. Let’s get started!",
      token,
    });
    const from = "admin <admin@stackearn.com>";
    const from1 = "Stackearn - Registration Successful!  <no-reply@stackearn.com>";

    const subject = "Welcome to Stackearn - Registration Successful! 🎉";
    const subject1 = ` New User Registration ${newUser.name} 🎉`;
    if (newUser) {
      await sendEmail({
        email: newUser.email,
        name: newUser.name,
        Webniarrecord: newUser,
        message: "Account created successfully. Let’s get started!",
        subject: subject,
        emailTemplate: RegisterEmail,
        from: from1
      });
    }
    await sendEmail({
      email: "stackearn@gmail.com",
      name: "Admin",
      datauser: newUser,
      message: "Your booking request was successful!",
      subject: subject1,
      emailTemplate: AdminEmail,
      from: from,

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


    return successResponse(res, "Account created successfully. Let’s get started!", 201, {
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
      return res.status(400).json({
        status: false,
        message: "Incorrect password. Please try again.",
      });
    }
    // Validate user role
    if (user.role !== role) {
      return res.status(403).json({
        status: false,
        message: "Access denied. Only user can log in.",
      });
    }

    // Generate a token for the user
    const token = await signToken(user._id);
    const Profile = await ProfileData.findOne({
      userId: user._id
    })
    res.json({
      status: true,
      message: "Login Successfully!",
      token,
      user,
      Profile
    });
  } catch (error) {
    logger.error("Error fetching booking:", error);
    return res.status(500).json({
      error,
      message: "An unknown error occurred. Please try later.",
    });
  }
});

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

exports.VerifyUser = catchAsync(async (req, res) => {
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
    const users = await User.find(query).skip(skip).limit(limitNumber).sort({
      created_at: -1
    });

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


exports.getUsersWithMonthRefDate = catchAsync(async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {
      role: 'user', // Adding filter for users with role 'user'
      passive_income: { $gt: 0 } // Adding filter for lastTodayIncome greater than 0
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
    const users = await User.find(query).skip(skip).limit(limitNumber).sort({
      created_at: -1
    });

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