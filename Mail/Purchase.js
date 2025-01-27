module.exports = (name) => {
  return `
    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff;">
      <tr bgcolor="#141414">
        <td style="padding: 20px 2px 0 2px; text-align: center;">
          <p style="margin: 1px;">
            <a href="https://www.its-invite.com/">
              <img style="max-width:150px;" src="https://f003.backblazeb2.com/file/Event-management/logo.png" alt="StackEarn Logo">
            </a>
          </p>
        </td>
      </tr>
      <tr bgcolor="#141414">
        <td style="padding: 40px 2px 10px 2px; text-align: center;">
          <p style="margin: 1px;">
            <img src="https://f003.backblazeb2.com/file/Event-management/forgetpass.png" alt="Thank You Image">
          </p>
        </td>
      </tr>
     
      <tr>
        <td style="padding: 20px; color: #ffffff;">
          <p style="margin: 0 0 20px;">Hello <strong>${name.name}</strong>,</p>
          <p style="margin: 0 0 20px;">Thank you for purchasing <strong>${name.cousreData || 'N/A'}</strong>! We are excited to have you on board and help you on your learning journey. Below are the details of your purchase:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; color: #ffffff;">
            <tr style="background-color: #444444; font-weight: bold;">
              <td style="padding: 8px; border: 1px solid #ddd;">Course Name</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name.cousreData || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">GST</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${"0 %"}</td>
            </tr>
            <tr style="background-color: #444444;">
              <td style="padding: 8px; border: 1px solid #ddd;">Transaction ID</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name.payment.payment_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Payment Date</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name.payment.created_at}</td>
            </tr>
            <tr style="background-color: #444444;">
              <td style="padding: 8px; border: 1px solid #ddd;">Payment Method</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${name.payment.payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Total Amount</td>
              <td style="padding: 8px; border: 1px solid #ddd;">₹${name.payment.amount}</td>
            </tr>
            <tr style="background-color: #444444;">
              <td style="padding: 8px; border: 1px solid #ddd;">Purchase Price</td>
              <td style="padding: 8px; border: 1px solid #ddd;">₹${name.payment.amount}</td>
            </tr>
          </table>
    
          <p style="margin: 0 0 20px;">Access Details:</p>
          <ul style="margin: 0 0 20px; padding: 0 0 0 20px; color: #dddddd;">
            <li>Your course is now available in your dashboard.</li>
            <li>You can start learning anytime.</li>
            <li>Lifetime access to all course materials.</li>
          </ul>
          <p style="margin: 0 0 20px; text-align: center;">
            <a href="https://www.its-invite.com/" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Access Your Dashboard Now</a>
          </p>
          <p style="margin: 0 0 20px;">If you have any questions or need assistance, feel free to contact our support team at 
          <a href="mailto:support@stackearn.com" style="color: #ffffff; text-decoration: none;">support@stackearn.com</a>
          .</p>
          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 0;"><strong>StackEarn Team</strong></p>
        </td>
      </tr>
      <tr style="background-color: #000000; text-align: center;">
        <td style="padding: 10px; font-size: 12px; color: #777777;">
          &copy; 2025 StackEarn. All rights reserved.
        </td>
      </tr>
    </table>
  `;
};
