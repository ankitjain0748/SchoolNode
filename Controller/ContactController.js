const EmailContact = require("../Mail/Ticket");
const contactmodal = require("../Model/Contact");
const catchAsync = require('../utill/catchAsync');
const sendEmail = require("../utill/Emailer");
const logger = require("../utill/Loggers");

exports.ContactPost = catchAsync(async (req, res) => {
    try {
        const { email, name, message, subject, role, phone_number, Email_verify } = req.body;

        if (!email || !name || !message || !subject || !role || !phone_number) {
            logger.warn("All fields (email, name, message, subject, role, phone_number) are required.")
            return res.status(400).json({
                status: false,
                message: "All fields (email, name, message, subject, role, phone_number) are required.",
            });
        }
        const record = new contactmodal({
            email, name, message, subject, role, phone_number, Email_verify
        });

        const result = await record.save();
        if (result.role = "support") {
            const subject1 = `Your Support Ticket ${result?._id} has been Created 🎉`;
            await sendEmail({
                email: email,
                support: result,
                message: "Your booking request was successful!",
                subject: subject1,
                emailTemplate: EmailContact,
            });

        }
        if (result) {
            res.json({
                status: true,
                message: "Request Sent Successfully!!.",
            });
        } else {
            res.json({
                status: false,
                error: result,
                message: "Failed to Contact.",
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            msg: "Failed to send Contact",
            error: error.message,
        });
    }
});

exports.ContactGet = catchAsync(async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;
        let query = {};
        const search = req.query.search ? String(req.query.search).trim() : "";
        const selectoption = req.query.selectoption ? String(req.query.selectoption).trim() : ""; // Assuming you'll use this later
        if (search?.trim() !== "") {
            query.name = { $regex: search, $options: 'i' };
        }
        // Add filter based on selectoption if provided
        if (selectoption) {
            query.Email_verify = selectoption; // Assuming 'valid' means verified
        }
        const totalcontactmodal = await contactmodal.countDocuments(query);
        const contactget = await contactmodal.find(query).sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const totalPages = Math.ceil(totalcontactmodal / limit);

        res.status(200).json({
            data: {
                contactget: contactget,
                totalcontactmodal: totalcontactmodal,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            },
            msg: "Contact Get",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            msg: "Failed to fetch Contact get",
            error: error.message,
        });
    }
});

// exports.ContactReply = async (req, res) => {
//     const { _id, reply_message } = req.body;

//     try {
//         const EmailFind = await contactmodal.findById(_id);
//         if (!EmailFind) {
//             return res.status(400).json({
//                 message: "Email Not Found",
//                 status: false,
//             });
//         }

//         const result = await contactmodal.findByIdAndUpdate(
//             EmailFind._id,
//             {
//                 reply_message,
//                 contact_status: "read",
//             },
//             { new: true }
//         );

//         const subject = "Thank You for Contact US"
//         if (result) {
//             await sendEmail(
//                 {
//                     email: result.email,
//                     name: result.name,
//                     message: result.reply_message,
//                     subject: subject,
//                     emailTemplate: EmailContact
//                 }
//             ); // Use the middleware to send the email
//             return res.json({
//                 status: true,
//                 message: "You have successfully replied to your query!",
//             });
//         } else {
//             return res.status(400).json({
//                 status: false,
//                 message: "No changes made.",
//             });
//         }
//     } catch (error) {
//         logger.error(error);
//         return res.status(500).json({
//             status: false,
//             error: error.message,
//             message: "Failed to update the contact.",
//         });
//     }
// };

exports.ContactDelete = catchAsync(async (req, res, next) => {
    try {
        const { Id } = req.body;
        if (!Id) {
            return res.status(400).json({
                status: false,
                message: 'CourseUpdate ID is required.',
            });
        }
        await contactmodal.findByIdAndDelete(Id);

        res.status(200).json({
            status: true,
            message: 'Contact deleted successfully.',
        });
    } catch (error) {
        logger.error(error)

        res.status(500).json({
            status: false,
            message: 'Internal Server Error. Please try again later.',
        });
    }
});