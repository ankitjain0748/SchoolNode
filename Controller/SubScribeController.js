const subscribemodal = require("../Model/Subscribe");
const User = require("../Model/User");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");
const sendEmail = require("../utill/Emailer");
const Subscriber = require("../Mail/Subscriber");
const contactmodal = require("../Model/Contact")

exports.SubscribePost = catchAsync(async (req, res) => {
    try {
        const { email, Email_verify } = req.body;
        const record = new subscribemodal({ email, Email_verify });
        const result = await record.save();
        const subject1 = "Welcome to Our Newsletter! 🎉";
        await sendEmail({
            email: email,
            message: "Your booking request was successful!",
            subject: subject1,
            emailTemplate: Subscriber,
        });

        if (result) {
            res.json({
                status: true,
                message: "Request Sent Successfully!!.",
            });
        } else {
            logger.info(result)
            res.json({
                status: false,
                error: result,
                message: "Failed to Contact.",
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: "Failed to Subscribe",
            error: error.message,
        });
    }
});

exports.Subscribeget = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalsubscribemodal = await subscribemodal.countDocuments();
        const subscribedata = await subscribemodal.find({}).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(totalsubscribemodal / limit);

        res.status(200).json({
            data: {
                subscribedata: subscribedata,
                totalsubscribemodal: totalsubscribemodal,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            message: "Subscribe Get",
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            message: "Failed to fetch Subscribe get",
            error: error.message,
        });
    }
});


exports.EmailDataSubScribe = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalsubscribemodal = await subscribemodal.countDocuments();
        const subscribedata = await subscribemodal.find({ Email_verify: "valid" }).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(totalsubscribemodal / limit);

        res.status(200).json({
            data: {
                subscribedata: subscribedata,
                totalsubscribemodal: totalsubscribemodal,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            message: "Subscribe Get",
        });
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            message: "Failed to fetch Subscribe get",
            error: error.message,
        });
    }
});


exports.EmailDataprofile = catchAsync(async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
        const skip = (page - 1) * limit;
        const users = await User.find({ role: "user", isDeleted: false, Email_verify: "valid", user_status: "Enrolled" })
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
            message: "Users retrieved successfully with bank details",
            data: {
                users: users,
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

exports.EmailDataContactGet = catchAsync(async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
        const skip = (page - 1) * limit;

        // Get emails from all three collections
        const contactEmails = await contactmodal.find({ Email_verify: "valid" }).select("email");
        const subscribeEmails = await subscribemodal.find({ Email_verify: "valid" }).select("email");
        const userEmails = await User.find({ role: "user", isDeleted: false, Email_verify: "valid" }).select("email");
        console.log("userEmails", userEmails)
        // Extract email lists
        const contactEmailList = contactEmails.map(contact => contact.email);
        console.log("contactEmailList", contactEmailList)
        const subscribeEmailList = subscribeEmails.map(subscribe => subscribe.email);
        console.log("subscribeEmailList", subscribeEmailList)
        const userEmailList = userEmails.map(user => user.email);
        const allEmails = [...contactEmailList, ...subscribeEmailList, ...userEmailList];
        const uniqueEmails = [...new Set(allEmails)];  // Remove duplicate emails
        console.log("uniqueEmails", uniqueEmails)
        const commonEmails = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
        const uniqueCommonEmails = [...new Set(commonEmails)]; // Remove duplicate common emails

        const commonUsers = await User.find({
            email: { $in: uniqueCommonEmails },
            role: "user",
            isDeleted: false,
            Email_verify: "valid",
            user_status: "Enrolled"
        })
            .populate("CourseId")
            .select("-password")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const users = await User.find({
            role: "user",
            isDeleted: false,
            Email_verify: "valid",
            user_status: "Enrolled",
            email: { $nin: uniqueCommonEmails }
        })
            .populate("CourseId")
            .select("-password")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments({
            role: "user",
            isDeleted: false,
            email: { $nin: uniqueCommonEmails }
        });
        const totalPages = Math.ceil(totalUsers / limit);

        // Return response with combined unique users
        return res.status(200).json({
            status: true,
            message: "Users retrieved successfully with bank details",
            data: {
                uniqueEmails: uniqueEmails,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
                EmailComman: uniqueCommonEmails  // Added the key "EmailComman"
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
