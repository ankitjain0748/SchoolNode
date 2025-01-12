const nodemailer = require('nodemailer');

const sendEmail = async (data) => {
    const { email, name, message, package, payment_id, subject, emailTemplate } = data;

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Replace with the app-specific password
        },
        debug: true, // Debug mode
    });

    const emailHtml = emailTemplate({ name, message, package, payment_id });

    const mailOptions = {
        from: 'contact@its-invite.com', // Ensure this matches your Zoho email
        to: email,
        subject: subject,
        html: emailHtml,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Rethrow the error to be caught in the controller
    }
};

module.exports = sendEmail;