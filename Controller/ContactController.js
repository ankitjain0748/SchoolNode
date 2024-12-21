// const EmailContact = require("../emailTemplates/ContactReply");
const contactmodal = require("../Model/Contact");
const catchAsync = require('../utill/catchAsync');
const logger = require("../utill/logger");
// const sendEmail = require("../utill/EmailMailler");

exports.ContactPost = catchAsync(async (req, res) => {
    try {
        const { email, name, message, subject, role, phone_number } = req.body;

        const record = new contactmodal({
            email, name, message, subject, role, phone_number
        });

        const result = await record.save();
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
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalcontactmodal = await contactmodal.countDocuments();
        const contactget = await contactmodal.find({}).sort({ created_at: -1 })
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

exports.ContactReply = async (req, res) => {
    const { _id, reply_message } = req.body;

    try {
        const EmailFind = await contactmodal.findById(_id);
        if (!EmailFind) {
            return res.status(400).json({
                message: "Email Not Found",
                status: false,
            });
        }

        const result = await contactmodal.findByIdAndUpdate(
            EmailFind._id,
            {
                reply_message,
                contact_status: "read",
            },
            { new: true }
        );

        const subject = "Thank You for Contact US"
        if (result) {
            await sendEmail(
                {
                    email: result.email,
                    name: result.name,
                    message: result.reply_message,
                    subject: subject,
                    emailTemplate: EmailContact
                }
            ); // Use the middleware to send the email
            return res.json({
                status: true,
                message: "You have successfully replied to your query!",
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "No changes made.",
            });
        }
    } catch (error) {
        logger.error(error);
        return res.status(500).json({
            status: false,
            error: error.message,
            message: "Failed to update the contact.",
        });
    }
};
// exports.Emailcheck = async (req, res) => {
//     try {
//         const result = {
//             email: "ankit.jain@futureprofilez.com",
//             name: "ankitjain",
//             reply_message: "Thank you for reaching out. We appreciate your feedback."
//         };
//         const subject = "Thank You for Contacting Us";
//         await sendEmail(subject, result.email, result.name, EmailBooking);

//         return res.json({
//             status: true,
//             message: "You have successfully replied to your query!",
//         });
//     } catch (error) {

//         return res.status(500).json({
//             status: false,
//             error: error.message,
//             message: "Failed to send the email.",
//         });
//     }
// };
