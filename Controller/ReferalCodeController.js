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

        const payment = await Payment.findOne({ UserId: userId });

        if (!payment) {
            return { status: false, message: "No payment record found for the user." };
        }

        // Fetch referral data based on referred_by, referred_first, and referred_second
        const referralData = await User.find({
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId }
            ]
        }).populate({
            path: "CourseId",
            select: "title discountPrice category courseImage"
        });

        // Fetch referral codes from the Referral table
        const referralCodes = await RefralModel.find({
            userId: { $in: referralData.map(user => user._id) } // Match with user IDs in the referral data
        });

        // Map referral codes to each user in the referral data
        const referralUsersWithCode = referralData.map(referralUser => {
            // Find the corresponding referral code
            const referralCode = referralCodes.find(code => code.userId.toString() === referralUser._id.toString());
            return {
                ...referralUser.toObject(),
                referralCode: referralCode ? referralCode.code : null, // Add referral code if exists
            };
        });

        // Send the response
        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            data: referralUsersWithCode,
            user: user,
            payment: payment
        });
    } catch (error) {
        console.error("Error fetching referral data:", error);
        return res.status(500).json({
            msg: "An error occurred while fetching referral data",
            status: false,
        });
    }
});









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