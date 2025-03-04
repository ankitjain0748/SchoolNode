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
    const userId = req.User?.id || req.query?.id;
    console.log("userId",userId)
    let { page = 1, limit = 10, paymentDate, name } = req.query;

    // Convert page and limit to numbers and handle invalid values
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

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

        // Fetch payment details (optional date filter)
        let paymentFilter = { UserId: userId };
        if (paymentDate) {
            paymentFilter.createdAt = {
                $gte: new Date(paymentDate + "T00:00:00.000Z"),
                $lt: new Date(paymentDate + "T23:59:59.999Z"),
            };
        }
        const payment = await Payment.findOne(paymentFilter);

        // Build referral search query
     
        const testReferrals = await User.find({
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId }
            ]
        }).populate("CourseId", "title discountPrice category courseImage").skip((page - 1) * limit)
        .limit(limit);
        
        console.log("Test Referrals with Course Data:", testReferrals);
        
        
        console.log("Test Referrals:", testReferrals);
        


        // Fetch referral data with pagination
       

        // Get total referral count (for pagination metadata)
        const totalReferrals = await User.countDocuments(testReferrals);

        const referralCodes = await RefralModel.find({
            $or: [
                { userId: { $in: testReferrals.map(user => user.referred_by).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_first).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_second).filter(id => id !== null) } }
            ]
        });
        
        
        console.log("Mapped User IDs for Referral Lookup:", testReferrals.map(user => user._id));

        
        
        console.log("Referral Codes:", referralCodes);
        
        // Combine user data with referral codes
        const referralUsersWithCode = testReferrals.map(referralUser => {
            const referralCode = referralCodes.find(code => code.userId.toString() === referralUser.referred_by?.toString());
            return {
                ...referralUser.toObject(),
                referral_code: referralCode ? referralCode.referral_code : null,
            };
        });
        
        console.log("Referral Users with Code and Course Data:", referralUsersWithCode);
    

       
        // Send the response
        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            page,
            limit,
            totalPages: Math.ceil(totalReferrals / limit),
            totalReferrals,
            data: referralUsersWithCode,
            user,
            payment: payment || null,
        });
    } catch (error) {
        console.error("Error fetching referral data:", error);
        return res.status(500).json({
            msg: "An error occurred while fetching referral data",
            status: false,
        });
    }
});

exports.RefralCodeGetId= catchAsync(async (req, res) => {
    const userId = req.User?.id ;
    console.log("userId",userId)
    let { page = 1, limit = 10, paymentDate, name } = req.query;

    // Convert page and limit to numbers and handle invalid values
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

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

        // Fetch payment details (optional date filter)
        let paymentFilter = { UserId: userId };
        if (paymentDate) {
            paymentFilter.createdAt = {
                $gte: new Date(paymentDate + "T00:00:00.000Z"),
                $lt: new Date(paymentDate + "T23:59:59.999Z"),
            };
        }
        const payment = await Payment.findOne(paymentFilter);

        // Build referral search query
     
        const testReferrals = await User.find({
            $or: [
                { referred_by: userId },
                { referred_first: userId },
                { referred_second: userId }
            ]
        }).populate("CourseId", "title discountPrice category courseImage").skip((page - 1) * limit)
        .limit(limit);
        
        console.log("Test Referrals with Course Data:", testReferrals);
        
        
        console.log("Test Referrals:", testReferrals);
        


        // Fetch referral data with pagination
       

        // Get total referral count (for pagination metadata)
        const totalReferrals = await User.countDocuments(testReferrals);

        const referralCodes = await RefralModel.find({
            $or: [
                { userId: { $in: testReferrals.map(user => user.referred_by).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_first).filter(id => id !== null) } },
                { userId: { $in: testReferrals.map(user => user.referred_second).filter(id => id !== null) } }
            ]
        });
        
        
        console.log("Mapped User IDs for Referral Lookup:", testReferrals.map(user => user._id));

        
        
        console.log("Referral Codes:", referralCodes);
        
        // Combine user data with referral codes
        const referralUsersWithCode = testReferrals.map(referralUser => {
            const referralCode = referralCodes.find(code => code.userId.toString() === referralUser.referred_by?.toString());
            return {
                ...referralUser.toObject(),
                referral_code: referralCode ? referralCode.referral_code : null,
            };
        });
        
        console.log("Referral Users with Code and Course Data:", referralUsersWithCode);
    

       
        // Send the response
        return res.status(200).json({
            msg: "Referral data retrieved successfully",
            status: true,
            page,
            limit,
            totalPages: Math.ceil(totalReferrals / limit),
            totalReferrals,
            data: referralUsersWithCode,
            user,
            payment: payment || null,
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