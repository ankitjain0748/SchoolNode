const nodemailer = require('nodemailer');

const sendEmail = async (data) => {
    const { email, name, datauser, message, cousreData, payment, subject,support,BlogRecord,Webniarrecord , dicount ,ImageUrl,BgImage ,SubContent,emailTemplate } = data;

    // Set up the transport for the email
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: "Gmail",
        secure: false,
        auth: {
            user: process.env.user, // Email address for sending
            pass: process.env.password, // App-specific password
        },
        debug: true, // Debug mode for SMTP communication (optional for troubleshooting)
    });

    // Generate the email HTML content using the email template function
    const emailHtml = emailTemplate({ name, message, cousreData, payment, datauser ,support,BlogRecord  ,Webniarrecord ,dicount, ImageUrl ,BgImage ,SubContent});
    // Define the email options
    const mailOptions = {
        from: 'sainibhim133@gmail.com', // Sender email (match with Gmail account)
        to: email, // Recipient's email
        subject: subject, // Subject of the email
        html: emailHtml, // HTML body of the email
    };

    try {
        // Send the email using nodemailer
        let info = await transporter.sendMail(mailOptions);
    } catch (error) {
        // Log the error if sending the email fails
        console.error('Error sending email:', error);
        throw error; // Optionally rethrow the error if you want to handle it elsewhere
    }
};

module.exports = sendEmail;
