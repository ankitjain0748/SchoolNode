const subscribemodal = require("../Model/Subscribe");
const User = require("../Model/User");
const catchAsync = require("../utill/catchAsync");
const logger = require("../utill/Loggers");
const sendEmail = require("../utill/Emailer");
const Subscriber = require("../Mail/Subscriber");
const contactmodal = require("../Model/Contact");
const WebinarModal = require("../Model/Webniar");
const WebniarEmail = require("../Mail/Webniar");
const Course = require("../Model/Course");
const PromtionEmail = require("../Mail/Promotion");
const OfferCourseEmail = require("../Mail/OfferCourse");

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
        console.log(req.query)

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const search = req.query.search ? String(req.query.search).trim() : ""; // Ensure search is a string
        const selectoption = req.query.selectedoption ? String(req.query.selectedoption).trim() : ""; // Assuming you'll use this later
      
        let query = {};

        if (search !== "") {
            query = { email: { $regex: new RegExp(search, "i") } }; // Use RegExp constructor
        }
        if (selectoption) {
            query.Email_verify = selectoption; // Assuming 'valid' means verified
        }

        const totalsubscribemodal = await subscribemodal.countDocuments(query);
        const subscribedata = await subscribemodal.find(query).sort({ created_at: -1 })
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

exports.SubscriberDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await subscribemodal.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'Subscribe deleted successfully.',
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
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
        const { page = 1, limit = 50, email } = req.query;
        console.log("req.query", req.query)
        // Ensure valid page and limit
        const pageNum = Math.max(parseInt(page) || 1, 1);
        const limitNum = Math.max(parseInt(limit) || 50, 1);
        const skip = (pageNum - 1) * limitNum;

        // Search filter (if email is provided)
        let filter = { role: "user", isDeleted: false, user_status: { $ne: "registered" }, Email_verify: "valid" };
        if (email) {
            filter.email = { $regex: email, $options: "i" }; // Case-insensitive search
        }

        // Fetch users with pagination and filtering
        const users = await User.find(filter)
            .select("-password")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limitNum);

        // Total users count for pagination
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limitNum);

        return res.status(200).json({
            status: true,
            message: "Users retrieved successfully with pagination and email search",
            data: {
                users,
                totalUsers,
                totalPages,
                currentPage: pageNum,
                perPage: limitNum,
                nextPage: pageNum < totalPages ? pageNum + 1 : null,
                previousPage: pageNum > 1 ? pageNum - 1 : null,
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching users.",
            error: error.message || "Internal Server Error",
        });
    }
});


exports.EmailDataContactGet = catchAsync(async (req, res, next) => {
    try {
        console.log("req" ,req.query)
        const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.max(parseInt(req.query.limit) || 50, 1); // Ensure limit is at least 1
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search ? req.query.search.trim() : null; // Get search query

        // Get emails from all three collections
        const contactEmails = await contactmodal.find({ Email_verify: "valid" }).select("email");
        const subscribeEmails = await subscribemodal.find({ Email_verify: "valid" }).select("email");
        const userEmails = await User.find({ role: "user", isDeleted: false, Email_verify: "valid" }).select("email");

        // Extract email addresses
        const contactEmailList = contactEmails.map(contact => contact.email);
        const subscribeEmailList = subscribeEmails.map(subscribe => subscribe.email);
        const userEmailList = userEmails.map(user => user.email);

        let allEmails = [...contactEmailList, ...subscribeEmailList, ...userEmailList];
        let uniqueEmails = [...new Set(allEmails)]; // Remove duplicates

        // Apply search filter if a query is provided
        if (searchQuery) {
            uniqueEmails = uniqueEmails.filter(email => email.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Paginate emails
        const paginatedEmails = uniqueEmails.slice(skip, skip + limit);
        const totalPages = Math.ceil(uniqueEmails.length / limit);

        return res.status(200).json({
            status: true,
            message: "Users retrieved successfully",
            data: {
                uniqueEmails: paginatedEmails,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
                totalEmails: uniqueEmails.length
            },
        });
    } catch (error) {
        logger.error("Error fetching users:", error);
        return res.status(500).json({
            status: false,
            message: "An error occurred while fetching users.",
            error: error.message || "Internal Server Error",
        });
    }
});

exports.WebniarEmail = catchAsync(async (req, res) => {
    try {
        const { title, selectedUsers, content, BgImage } = req.body;
        const record = await WebinarModal.findOne({ title });
        const subject1 = `Join Our Exclusive Webinar: ${title} - Register Now!🎉`;
        for (const email of selectedUsers) {
            try {
                await sendEmail({
                    email: email,
                    message: content,
                    BgImage: BgImage,
                    Webniarrecord: record,
                    subject: subject1,
                    emailTemplate: WebniarEmail,
                });
                console.log(`Email successfully sent to: ${email}`);
            } catch (error) {
                console.error(`Failed to send email to: ${email}`, error);
            }
        }
        res.json({
            status: true,
            message: "Request Sent Successfully!!.",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: "Failed to Subscribe",
            error: error.message,
        });
    }
});

exports.promtionalEmail = catchAsync(async (req, res) => {
    try {
        const { title, selectedUsers, content, dicount, BgImage } = req.body;
        const record = await Course.findOne({ title });
        const subject1 = `${title} - Master New Skills Today! Limited Offer: ${dicount} % OFF!🎉`;
        for (const email of selectedUsers) {
            try {
                await sendEmail({
                    email: email,
                    message: content,
                    Webniarrecord: record,
                    dicount: dicount,
                    BgImage: BgImage,
                    subject: subject1,
                    emailTemplate: PromtionEmail,
                });
                console.log(`Email successfully sent to: ${email}`);
            } catch (error) {
                console.error(`Failed to send email to: ${email}`, error);
            }
        }

        res.json({
            status: true,
            message: "Request Sent Successfully!!.",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: "Failed to Subscribe",
            error: error.message,
        });
    }
});

exports.OfferCourseEmail = catchAsync(async (req, res) => {
    try {
        const { title, selectedUsers, content, dicount, courseImage, BgImage, SubContent } = req.body;
        const record = await Course.findOne({ title });
        const subject1 = `🎉 Special Offer:${title} at ${dicount}% Off! Enroll Now!`;
        for (const email of selectedUsers) {
            try {
                await sendEmail({
                    email: email,
                    message: content,
                    Webniarrecord: record,
                    dicount: dicount,
                    ImageUrl: courseImage,
                    BgImage: BgImage,
                    SubContent: SubContent,
                    subject: subject1,
                    emailTemplate: OfferCourseEmail,
                });
                console.log(`Email successfully sent to: ${email}`);
            } catch (error) {
                console.error(`Failed to send email to: ${email}`, error);
            }
        }

        res.json({
            status: true,
            message: "Request Sent Successfully!!.",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: "Failed to Subscribe",
            error: error.message,
        });
    }
});