const jwt = require("jsonwebtoken");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const ForgetPassword = require("../Mail/ForgetPassword");
const { validationErrorResponse, errorResponse, successResponse } = require("../utill/ErrorHandling");
const VerifyAccount = require("../Mail/VerifyAccount");
const ProfileData = require("../Model/Profile");
const logger = require("../utill/Loggers");
const { default: mongoose } = require("mongoose");

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
    expiresIn: "3m",
  });
  return token;
};

exports.signup = catchAsync(async (req, res) => {
  try {
    const { email, password, name, phone_number, referred_by } = req.body;
    // Check for existing user by email or phone number
    const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors.email = "Email is already in use!";
      }
      if (existingUser.phone_number === phone_number) {
        errors.phone_number = "Phone number is already in use!";
      }
      return res.status(400).json({
        status: false,
        message: "Email or phone number already exists",
        errors,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate and handle referral
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
        // Ensure referred_by is treated as an ObjectId
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
      referrerdata = await User?.findOne({ _id: referrerObjectId });
      if (!referrerdata) {
        return res.status(400).json({
          status: false,
          message: "Invalid referral code",
        });
      }
    }
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      phone_number,
      referred_by: referrer?._id || null,
      referred_second: referrerdata?._id || null,
      referred_first: referrers?._id || null
    });

    const result = await newUser.save();



    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $addToSet: { referrals: result._id },
      });
    }

    // Optional: Update referrer data with the new referral
    if (referrers) {
      await User.findByIdAndUpdate(referrers._id, {
        $addToSet: { referrals: result._id },
      });
    }

    if (referrerdata) {
      await User.findByIdAndUpdate(referrerdata._id, {
        $addToSet: { referrals: result._id },
      });
    }
    return successResponse(res, "You have been registered successfully!", 201, {
      userId: result._id,
    });
  } catch (error) {
    logger.error("Error during signup:", error);
    return errorResponse(res, error.message || "Internal Server Error", 500);
  }
});



exports.adminlogin = catchAsync(async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(401).json({
        status: false,
        message: "Email and password are required!",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
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

    // Check if the user account is inactive
    if (user.user_status === "inactive") {
      return res.status(403).json({
        status: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Check if the user is verified
    // if (!user.verified) {
    //   return res.status(403).json({
    //     status: false,
    //     message: "Your account is not verified. Please verify it.",
    //   });
    // }

    // Validate user role
    if (user.role !== role) {
      return res.status(403).json({
        status: false,
        message: "Access denied. Only admins can log in.",
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
    if (user.user_status === "inactive") {
      logger.warn("Your account is inactive. Please contact support.")
      return res.status(403).json({
        status: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

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
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
    const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
    const skip = (page - 1) * limit;
    const updatedUsers = await User.find({ role: "user", isDeleted: false })
      .select("-password")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // Total users and pagination details
    const totalUsers = await User.countDocuments({ role: "user", isDeleted: false });
    const totalPages = Math.ceil(totalUsers / limit);

    // Return response
    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully with enquiry counts updated",
      data: {
        users: updatedUsers,
        totalUsers,
        totalPages,
        currentPage: page,
        perPage: limit,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    logger.error("Error fetching booking:", error);

    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching users and updating enquiry counts.",
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

exports.forgotlinkrecord = async (req, res) => {
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
    const resetLink = `https://user-event.vercel.app/forgotpassword/${token}`;
    const customerUser = record.username;
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.user,
        pass: process.env.password,
      },
    });
    const emailHtml = ForgetPassword(resetLink, customerUser);
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
};

exports.forgotpassword = async (req, res) => {
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
};


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
    if (!profileData) {
      return res.status(404).json({ msg: "Profile data not found" });
    }

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
      // Perform an exact match with case insensitivity if required
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


exports.VerifyUser = async (req, res) => {
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
};


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



// dashboardApi

exports.getCount = catchAsync(async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const RecentCount = await Enquiry.countDocuments();
    const packages = await Package.find({}).limit(3).select("package_name package_image package_categories");
    const EnquiryData = await Enquiry.find({}).limit(3);
    return res.status(200).json({
      status: true,
      message: " Data retrieved successfully",
      userCount: userCount,
      bookingCount: bookingCount,
      EnquiryCount: RecentCount,
      packages: packages,
      EnquiryData: EnquiryData
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching the user count.",
      error: error.message,
    });
  }
});

// if (username) {
//   // Perform an exact match instead of regex if required
//   filter.username = username;  // Use exact match
//   // Or if you want partial match, uncomment below and comment out above line
//   // filter.username = { $regex: `^${username}$`, $options: 'i' };
// }


