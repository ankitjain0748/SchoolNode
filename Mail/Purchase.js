module.exports = (name) => {
  console.log("name",name)
  return `
    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff;">
      <tr bgcolor="#141414">
        <td style="padding: 20px 2px 0 2px; text-align: center;">
          <p style="margin: 1px;">
            <a href="https://www.stackearn.com/">
              <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/applogo.png" alt="StackEarn Logo">
            </a>
          </p>
        </td>
      </tr>
     
     
      <tr>
        <td style="padding: 20px; color: #ffffff;">
          <p style="margin: 0 0 20px;">Hello <strong style="text-transform: uppercase;">${name.name}</strong>
,</p>
          <p style="margin: 0 0 20px;">Thank you for purchasing <strong style="color: #007bff ;"> ${name.cousreData || 'N/A'} </strong>! We are excited to have you on board and help you on your learning journey. Below are the details of your purchase:</p>
          
     <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #FFF000; color: #ffffff;">
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Course Name</td>
    <td style="padding: 8px; border: 1px solid #ffffff;">${name.cousreData || 'N/A'}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">GST</td>
    <td style="padding: 8px; border: 1px solid #ffffff;">{"0 %"}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Transaction ID</td>
    <td style="padding: 8px; border: 1px solid #ffffff;">${name.payment.payment_id}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Payment Date</td>
    <td style="padding: 8px; border: 1px solid #ffffff;">${name.payment.created_at}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Payment Method</td>
    <td style="padding: 8px; border: 1px solid #ffffff;">${name.payment.payment_method}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Total Amount</td>
    <td style="padding: 8px; border: 1px solid #ffffff; color: #28a745;">₹${name.payment.amount}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ffffff;">Purchase Price</td>
    <td style="padding: 8px; border: 1px solid #ffffff; color: #28a745;">₹${name.payment.amount}</td>
  </tr>
</table>


          <p style="margin: 0 0 20px;">Access Details:</p>
          <ul style="margin: 0 0 20px; padding: 0 0 0 20px; color: #dddddd;">
            <li>Your course is now available in your dashboard.</li>
            <li>You can start learning anytime.</li>
            <li>Lifetime access to all course materials.</li>
          </ul>
          </p>

    <p style="padding: 10px; text-align: center;">
  <a href="https://www.stackearn.com/student/student-courses" 
     style="display: inline-block; padding: 10px 10px; background-color: transparent; color: #ffffff; font-size: 12px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉 Read Full Post
  </a>
</p>

<p style="margin: 0 0 20px; font-size: 12px; text-align: center;">
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
