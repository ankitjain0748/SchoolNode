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
const Transaction = require("../Model/Transcation");
const Bank = require("../Model/Bank");
const TempUser = require("../Model/TempUser");
const SocialSection = require("../Model/Social");
const RegisterEmail = require("../Mail/RegisterEmail");
const AdminEmail = require("../Mail/AdminRegister");
const sendEmail = require("../utill/Emailer");
const Payout = require("../Mail/Payout");

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
    // if (user.user_status === "inactive") {
    //   return res.status(403).json({
    //     status: false,
    //     message: "Your account is inactive. Please contact support.",
    //   });
    // }

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
    const search = req.query.search ? String(req.query.search).trim() : "";
    let query = { role: "user", isDeleted: false };

    if (search !== "") {
      query.name = { $regex: new RegExp(search, "i") }; 
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

    console.log('Bank Details:', bankDetails);  // Debugging: log fetched bank details
    console.log('Profile Details:', profileDetails);  // Debugging: log fetched profile details

    // Map the users with their bank and profile details
    const usersWithBankDetails = users.map(user => {
      // Bank detail safely fetch karein
      const bankDetail = bankDetails.find(bank => bank?.userId === user?._id);
      
      // Profile detail safely fetch karein
      const profileDetail = profileDetails.find(profile => profile?.userId === user?._id);
  
      return {
          ...user.toObject(),
          bank_details: bankDetail || null,
          ProfileDetails: profileDetail || null
      };
  });
  
  console.log("usersWithBankDetails", usersWithBankDetails); // Check the output
  

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
    const resetLink = `http://localhost:3000/new-password/${token}`;
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


// working Api  
// exports.userupdateby = catchAsync(async (req, res, next) => {
//   try {
//     const {
//       Id,
//       payment_type,
//       referred_user_pay,
//       widthrawal_reason,
//       success_reasons,
//       payment_data,
//       payment_income,
//     } = req.body;

//     if (!Id) {
//       return res.status(400).json({
//         status: false,
//         message: "User ID is required.",
//       });
//     }

//     // Update user data
//     const updatedRecord = await User.findByIdAndUpdate(
//       Id,
//       { referred_user_pay, payment_data },
//       { new: true, runValidators: true }
//     );

//     if (!updatedRecord) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found!",
//       });
//     }

//     const transactionData = new Transaction({
//       user: Id,
//       referred_user_pay,
//       widthrawal_reason,
//       success_reasons,
//       payment_data,
//       payment_type,
//       payment_income,
//     });

//     const result = await transactionData.save();


//     res.status(200).json({
//       status: true,
//       result: result,
//       message: "User updated and transaction recorded successfully.",
//     });
//   } catch (error) {
//     logger.error("Error updating user and transaction record:", error);

//     res.status(500).json({
//       status: false,
//       message:
//         "An error occurred while updating the User and transaction. Please try again later.",
//       error: error.message,
//     });
//   }
// });

exports.paymentdata = catchAsync(async (req, res) => {
  try {
    const { Id, data_payment, success_reasons, payment_type, paymentMethod, payment_reason, transactionId, payment_data, payment_income, referred_user_pay, payment_key, page, withdrawal_reason } = req.body;
    if (!Id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }
    const newPayment = new Adminpayment({
      userId: Id, // Ensure the ID is the same
      paymentMethod,
      payment_type,
      success_reasons,
      payment_reason,
      withdrawal_reason,
      payment_key,
      transactionId,
      payment_data,
      payment_income,
      data_payment,
      payment_income,
      page,
      referred_user_pay,
    });

    // Save the payment record
    const paymentRecord = await newPayment.save();

    // If no payment record was saved (edge case)
    if (!paymentRecord) {
      return res.status(400).json({
        status: false,
        message: "Failed to save payment data.",
      });
    }

    // Update the user with the new payment data
    const updatedUser = await User.findByIdAndUpdate(
      Id,
      {
        payment_data,
        referred_user_pay

      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found for update!",
      });
    }

    // Send success response
    res.status(200).json({
      status: true,
      message: "Payment data saved and user updated successfully.",
      paymentRecord,
      updatedUser,
    });
    const subject1 = "🎉 Your Payout Has Been Successfully Received!";
    if (page === "payout") {
      await sendEmail({
        email: updatedUser.email,
        name: updatedUser.name,
        Webniarrecord: paymentRecord,
        subject: subject1,
        emailTemplate: Payout,
      })
    };

  } catch (error) {
    console.error("Error saving payment data and updating user:", error);

    res.status(500).json({
      status: false,
      message: "An error occurred while processing the payment. Please try again later.",
      error: error.message,
    });
  }
});

// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
// }
// exports.OTP = catchAsync(async (req, res) => {
//   try {
//     const {
//       email, password, name, phone_number, referred_by
//     } = req.body;

//     // // Check if required fields are "provided"
//     // if (!password || !phone_number || !username || !email || !address || !country) {
//     //   return res.status(401).json({
//     //     status: false,
//     //     message: 'All fields are required',
//     //   });
//     // }

//     // Check if user already exists
//     const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
//     if (existingUser) {
//       const errors = {};
//       if (existingUser.email === email) {
//         errors.email = "Email is already in use!";
//       }
//       if (existingUser.phone_number === phone_number) {
//         errors.phone_number = "Phone number is already in use!";
//       }
//       return res.status(400).json({
//         status: false,
//         message: "Email or phone number already exists",
//         errors,
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);



//     const otp = generateOTP();

//     let referrer = null;
//     if (referred_by) {
//       referrer = await User.findOne({ referral_code: referred_by });
//       if (!referrer) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid referral code",
//         });
//       }
//     }
//     let referrers = null;
//     if (referrer?.referred_by) {
//       try {
//         // Ensure referred_by is treated as an ObjectId
//         const referrerObjectId = new mongoose.Types.ObjectId(referrer.referred_by);
//         referrers = await User.findOne({ _id: referrerObjectId });
//         if (!referrers) {
//           return res.status(400).json({
//             status: false,
//             message: "Invalid second referral code",
//           });
//         }
//       } catch (error) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid ObjectId format",
//         });
//       }
//     }
//     let referrerdata = null;
//     if (referrers?.referred_by) {
//       const referrerObjectId = new mongoose.Types.ObjectId(referrers.referred_by);
//       referrerdata = await User?.findOne({ _id: referrerObjectId });
//       if (!referrerdata) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid referral code",
//         });
//       }
//     }
//     const newUser = new User({
//       email,
//       password: hashedPassword,
//       name,
//       phone_number,
//       referred_by: referrer?._id || null,
//       referred_second: referrerdata?._id || null,
//       referred_first: referrers?._id || null,
//       OTP: otp,
//     });

//     const result = await newUser.save();

//     if (referrer) {
//       await User.findByIdAndUpdate(referrer._id, {
//         $addToSet: { referrals: result._id },
//       });
//     }

//     // Optional: Update referrer data with the new referral
//     if (referrers) {
//       await User.findByIdAndUpdate(referrers._id, {
//         $addToSet: { referrals: result._id },
//       });
//     }

//     if (referrerdata) {
//       await User.findByIdAndUpdate(referrerdata._id, {
//         $addToSet: { referrals: result._id },
//       });
//     }


//     if (result) {
//       const customerUser = result.name;
//       let transporter = nodemailer.createTransport({
//         host: process.env.MAIL_HOST,
//         port: parseInt(process.env.MAIL_PORT, 10),
//         secure: process.env.MAIL_PORT === '465', // true for 465, false for 587
//         auth: {
//           user: process.env.user,
//           pass: process.env.password,
//         },
//         tls: {
//           rejectUnauthorized: false, // Ignore certificate errors (useful for self-signed certs)
//         },
//       });

//       const emailHtml = VerifyAccount(otp, customerUser);
//       const recorddd = await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: result.email,
//         subject: "Verify your Account",
//         html: emailHtml,
//       });

//       return successResponse(res, "OTP has been sent to your email!", 201);
//     } else {
//       return errorResponse(res, "Failed to create user.", 500);
//     }
//   } catch (error) {
//     return errorResponse(res, error.message || "Internal Server Error", 500);
//   }
// });


// exports.VerifyOtp = catchAsync(async (req, res, next) => {
//   try {
//     const { email, OTP } = req.body;
//     if (!email || !OTP) {
//       return res.status(401).json({
//         status: false,
//         message: "Email and OTP are required!",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({
//         status: false,
//         message: "Invalid Email or OTP",
//       });
//     }

//     if (user.OTP != OTP) {
//       return res.status(401).json({
//         status: false,
//         message: "Invalid OTP",
//       });
//     }

//     user.verified = true;
//     await user.save();

//     const token = await signToken(user._id);
//     res.json({
//       status: true,
//       message: "Your account has been verified.",
//       token,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "An unknown error occurred. Please try later.",
//     });
//   }
// });


// Function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

exports.isValidEmail = (email) => { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return emailRegex.test(email); };

exports.OTP = catchAsync(async (req, res) => {
  try {
    const { email, password, name, phone_number, referred_by, Email_verify } = req.body;
    // Validate email format
    // if (!isValidEmail(email)) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Invalid email format",
    //   });
    // }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email or phone number already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();



    // Check referral code and get referrer details
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

    // Save the user data and OTP in a temporary object
    const tempUser = {
      email,
      password: hashedPassword,
      name,
      phone_number,
      referred_by: referrer ? referrer._id : null,
      referred_first: referrers ? referrers._id : null,
      referred_second: referrerdata ? referrerdata._id : null,
      OTP: otp,
      Email_verify: Email_verify
    };

    // Send OTP email
    await TempUser.create(tempUser);



    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: process.env.MAIL_PORT === '465', // true for 465, false for 587
      auth: {
        user: process.env.user,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false, // Ignore certificate errors (useful for self-signed certs)
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
    // Store tempUser in a temporary collection or in-memory store

  } catch (error) {
    return res.status(500).json({
      error,
      message: "Internal Server Error",
    });
  }
});

// Exported function to send OTP
// exports.OTP = catchAsync(async (req, res) => {
//   try {
//     const { email, password, name, phone_number, referred_by } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
//     if (existingUser) {
//       return res.status(400).json({
//         status: false,
//         message: "Email or phone number already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);
//     const otp = generateOTP();

//     // Check referral code and get referrer details
//     let referrer = null;
//     if (referred_by) {
//       referrer = await User.findOne({ referral_code: referred_by });
//       if (!referrer) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid referral code",
//         });
//       }
//     }
//     let referrers = null;
//     if (referrer?.referred_by) {
//       try {
//         // Ensure referred_by is treated as an ObjectId
//         const referrerObjectId = new mongoose.Types.ObjectId(referrer.referred_by);
//         referrers = await User.findOne({ _id: referrerObjectId });
//         if (!referrers) {
//           return res.status(400).json({
//             status: false,
//             message: "Invalid second referral code",
//           });
//         }
//       } catch (error) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid ObjectId format",
//         });
//       }
//     }
//     let referrerdata = null;
//     if (referrers?.referred_by) {
//       const referrerObjectId = new mongoose.Types.ObjectId(referrers.referred_by);
//       referrerdata = await User?.findOne({ _id: referrerObjectId });
//       if (!referrerdata) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid referral code",
//         });
//       }
//     }

//     // Save the user data and OTP in a temporary object
//     const tempUser = {
//       email,
//       password: hashedPassword,
//       name,
//       phone_number,
//       referred_by: referrer ? referrer._id : null,
//       referred_first: referrers ? referrers._id : null,
//       referred_second: referrerdata ? referrerdata._id : null,
//       OTP: otp,
//     };

//     // Send OTP email
//     let transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: parseInt(process.env.MAIL_PORT, 10),
//       secure: process.env.MAIL_PORT === '465', // true for 465, false for 587
//       auth: {
//         user: process.env.user,
//         pass: process.env.password,
//       },
//       tls: {
//         rejectUnauthorized: false, // Ignore certificate errors (useful for self-signed certs)
//       },
//     });

//     const emailHtml = VerifyAccount(otp, tempUser.name);
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: tempUser.email,
//       subject: "Verify your Account",
//       html: emailHtml,
//     });

//     // Store tempUser in a temporary collection or in-memory store
//     await Tem.create(tempUser);

//     return res.status(201).json({
//       status: true,
//       message: "OTP has been sent to your email!",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "Internal Server Error",
//     });
//   }
// });

// Exported function to verify OTP
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
      Email_verify: tempUser?.Email_verify
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    console.log("req.query",req.query)
    const { search, page = 1, limit = 10 } = req.query;

    if (search) {
      search.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }
    // Pagination setup
    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;
    // Find users with today's ref_date and search criteria
    const users = await User.find(query)
      .skip(skip)
      .limit(limitNumber);
    // Fetch details for referred users and bank details
    const userDetails = await Promise.all(
      users.map(async (user) => {
        const [referredBy, referredFirst, referredSecond, userBankDetails] =
          await Promise.all([
            user.referred_by ? User.findById(user.referred_by).select("-password") : null,
            user.referred_first ? User.findById(user.referred_first).select("-password") : null,
            user.referred_second ? User.findById(user.referred_second).select("-password") : null,
            Bank.findOne({ userId: user._id }),
          ]);

        const [referredByBankDetails, referredByProfileDetails, referredFirstBankDetails, referredSecondBankDetails] =
          await Promise.all([
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

    // Total count for pagination metadata
    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: userDetails,
      pagination: {
        totalUsers,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching users",
      error: err.message,
    });
  }
});


exports.profileadmin = catchAsync(async (req, res, next) => {
  try {
    const adminUser = await User.findOne({ role: "admin", isDeleted: false }).select("-password");
    const SocialAdmin = await SocialSection.findOne({ userId: adminUser?._id });
    const ProfileAdmin = await ProfileData.findOne({ userId: adminUser?._id });

    if (!adminUser) {
      return res.status(404).json({
        status: false,
        message: "Admin user not found.",
      });
    }
    const users = await User.find({ role: "user", user_status: { $ne: "registered" }, isDeleted: false });

    const userCount = await User.countDocuments();
    let activeCount = 0;
    let inactiveCount = 0;

    for (const user of users) {
      const { referred_user_pay, second_user_pay, first_user_pay } = user;
      const totalPayment = referred_user_pay || 0;
      const userStatus = adminUser?.ActiveUserPrice >= totalPayment ? 'inactive' : 'active';
      const percentageValue = (((second_user_pay || 0) + (first_user_pay || 0)) * (adminUser?.InActiveUserPercanetage || 0)) / 100;
      const validPercentageValue = isNaN(percentageValue) ? 0 : percentageValue;

      await User.findByIdAndUpdate(
        user._id,
        {
          $set: { user_status: userStatus },
          $inc: { passive_income: validPercentageValue },
        },
        { new: true }
      );

      // Update counters
      if (userStatus === 'active') {
        activeCount++;
      } else {
        inactiveCount++;
      }
    }

    res.status(200).json({
      status: true,
      message: "Users retrieved and updated successfully with enquiry counts updated",
      data: {
        adminUser,
        userCount,
        activeCount,
        inactiveCount,
      },
      ProfileAdmin: ProfileAdmin,
      SocialAdmin: SocialAdmin
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching and updating users.",
      error: error.message || "Internal Server Error",
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
