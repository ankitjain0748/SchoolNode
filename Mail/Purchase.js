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
     
     
      <tr>
        <td style="padding: 20px; color: #ffffff;">
          <p style="margin: 0 0 20px;">Hello <strong>${name.name}</strong>,</p>
          <p style="margin: 0 0 20px;">Thank you for purchasing <strong> ${name.cousreData || 'N/A'} </strong>! We are excited to have you on board and help you on your learning journey. Below are the details of your purchase:</p>
          
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #ffffff; color: #ffffff;">
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Course Name</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">${name.cousreData || 'N/A'}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">GST</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">${"0 %"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Transaction ID</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">${name.payment.payment_id}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Payment Date</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">${name.payment.created_at}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Payment Method</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">${name.payment.payment_method}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Total Amount</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">₹${name.payment.amount}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 2px solid #ffffff;">Purchase Price</td>
    <td style="padding: 8px; border: 2px solid #ffffff; font-weight: bold;">₹${name.payment.amount}</td>
  </tr>
</table>

          <p style="margin: 0 0 20px;">Access Details:</p>
          <ul style="margin: 0 0 20px; padding: 0 0 0 20px; color: #dddddd;">
            <li>Your course is now available in your dashboard.</li>
            <li>You can start learning anytime.</li>
            <li>Lifetime access to all course materials.</li>
          </ul>
     <p style="margin: 0 0 20px; text-align: center;">
  <a href="https://www.its-invite.com/" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 5px; font-size: 14px;">Go to Dashboard</a>
</p>
<p style="margin: 0 0 20px; font-size: 14px; text-align: center;">
  If you have any questions or need assistance, feel free to contact our support team at 
  <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;">support@stackearn.com</a>.
</p>


          <p style="margin: 0;">Best regards,</p>
          <p style="margin: 0;">StackEarn Team</p>
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
