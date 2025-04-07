const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const ProfileData = require("../Model/Profile");
const logger = require("../utill/Loggers");
const Bank = require("../Model/Bank");

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

exports.UserPriceUpdate = catchAsync(async (req, res, next) => {
  try {
    const UserId = req?.User?._id;
    const { price, percentage } = req.body;
console.log("UserId" , UserId)
    console.log("req.body" , req.body)
    if (!UserId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }

    // Step 1: Update Admin User Prices
    const updatedRecord = await User.findByIdAndUpdate(
      UserId,
      {
        ActiveUserPrice: price,
        InActiveUserPercanetage: Number(percentage),
      },
      { new: true, runValidators: true }
    );

    console.log("updatedRecord" ,updatedRecord)
    if (!updatedRecord) {
      return res.status(404).json({
        status: false,
        message: "User not found!",
      });
    }


    res.status(200).json({
      status: true,
      message: "User prices & statuses updated successfully.",
    });
  } catch (error) {
    console.error("❌ Error in UserPriceUpdate:", error);

    res.status(500).json({
      status: false,
      message: "An error occurred while updating users.",
      error: error.message,
    });
  }
});


