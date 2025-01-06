const UserModel = require("../Model/User");
const RefralModel = require("../Model/Referal");
const logger = require("../utill/Loggers");
const catchAsync = require("../utill/catchAsync");
const User = require("../Model/User");
const Course = require("../Model/Course");
const Payment = require("../Model/Payment");

exports.RefralCodeAdd = catchAsync(async (req, res) => {
    const userId = req?.User?._id;
    try {
        const { referralCode, referred_by, referred_to } = req.body;

        // Validate input
        if (!referralCode) {
            logger.warn("All fields are required");
            return res.status(400).json({
                message: "All fields are required",
                status: false,
            });
        }

        let _id = userId
        // Update User table with referral information
        const userUpdate = await UserModel.findByIdAndUpdate(
            _id,
            {
                $set: { referral_code: referralCode },
            },
            { new: true } // Return updated document
        );

        // Save referral data to ReferralModel
        const referral = new RefralModel({
            referral_code: referralCode,
            referred_by,
            referred_to,
            userId,
        });

        const referralData = await referral.save();


        // Response back to the client
        res.json({
            message: "Referral saved and user updated successfully",
            status: true,
            data: {
                referral: referralData,
                user: userUpdate,
            },
        });
    } catch (error) {
        logger.error(error);
        console.log("Error:", error);
        res.status(500).json({
            message: "Referral add failed",
            status: false,
            error: error.message,
        });
    }
});


exports.RefralCodeGet = catchAsync(async (req, res) => {
    const userId = req.User?._id;

    console.log("Received userId:", userId);

    // Check if userId exists
    if (!userId) {
        return res.status(400).json({
            msg: "User ID is missing",
            status: false,
        });
    }

    try {
        // Fetch the main user with populated CourseId
        const user = await User.findById(userId).populate("CourseId");
        if (!user) {
            return res.status(404).json({
                msg: "User not found",
                status: false,
            });
        }

        // Fetch referral data
        const referralData = await User.find({
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId }
            ]
        });

        console.log("Referral Data:", referralData);

        // Send the response
        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            data: referralData,
            user : user
        });
    } catch (error) {
        console.error("Error fetching referral data:", error);
        return res.status(500).json({
            msg: "An error occurred while fetching referral data",
            status: false,
        });
    }
});




// exports.RefralCodeGet = catchAsync(async (req, res) => {
//     const userId = req.User?._id;

//     if (!userId) {
//         return res.status(400).json({
//             msg: "User ID is missing",
//             status: false,
//         });
//     }

//     try {
//         // Fetch the main user data
//         const user = await User.findById(userId).populate("CourseId"); // Populate CourseId for the main user
//         if (!user) {
//             return res.status(404).json({
//                 msg: "User not found",
//                 status: false,
//             });
//         }

//         const Users = await User.find(userId);
//         console.log("userId" , Users)
//         const { referred_by, referred_first, referred_second } = user;

//         const referredUsers = await User.find({
//             _id: { $in: [referred_by, referred_first, referred_second] },
//         });

//         const mergedData = await Promise.all(
//             referredUsers.map(async (user) => {
//                 const courseDetails = user.CourseId ? await Course.findById(user.CourseId) : null;
//                 const paymentDetails = await Payment.findOne({ UserId: user._id });

//                 return {
//                     ...user.toObject(),
//                     courseName: courseDetails,
//                     payments: paymentDetails,
//                 };
//             })
//         );

//         res.json({
//             msg: "Referral and Course Data",
//             status: true,
//             user,
//             referredUsers: mergedData,
//         });
//     } catch (error) {
//         logger.error("Error fetching referral and course data:", error);
//         res.status(500).json({
//             msg: "Failed to fetch referral and course data",
//             status: false,
//             error: error.message,
//         });
//     }
// });



exports.RefralCodeDelete = catchAsync(async (req, res) => {
    try {
        const { Id } = req.params;
        const RefralDelete = await RefralModel.findByIdAndDelete({ _id: Id });
        res.json({
            status: true,
            data: RefralDelete,
            message: "Refral deleted successfully"
        })
    } catch (error) {
        logger.error(error);
        console.log("error", error)
        res.json({
            msg: "Refral  Failed ",
            status: false,
            error: error.message
        })

    }
})