module.exports = (userData) => {
  const userEmail = userData?.datauser?.email || 'N/A';
  const userMobile = `${userData?.datauser?.phone_code || '+91'} ${userData?.datauser?.phone_number || 'N/A'}`;
  return `
      <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff;">
        <tr bgcolor="#141414">
          <td style="padding: 20px 2px 20px 2px; text-align: center;">
            <p style="margin: 1px;">
              <a href="https://www.stackearn.com/">
                <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/Adobe+Express+-+file.jpg" alt="StackEarn Logo">
              </a>
            </p>
          </td>
        </tr>
       
        <tr>
          <td style="padding: 20px; color: #ffffff;">
            <p style="margin: 0 0 20px;  font-size: 12px;">Hello Admin,</p>
            <p style="margin: 0 0 20px;  font-size: 12px;">
              A new purchase has been made. Here are the details:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; color: #ffffff;">
  <!-- User Info Section -->
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;" colspan="2" style="background-color: #4F46E5; color: #ffffff;">User Info</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">Name</td>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">${userData?.datauser?.name}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd ;  font-size: 12px;">Email</td>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px; ">
      <a href="mailto:${userEmail}" style="color: #000fff; text-decoration: none;">${userEmail}</a>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px;  font-size: 12px; border: 1px solid #ddd;">Phone</td>
    <td style="padding: 8px; border: 1px solid #ddd; ">
      <a href="tel:${userMobile}" style="  font-size: 12px; color: #ffffff; text-decoration: none;">${userMobile}</a>
    </td>
  </tr>
  
  </tr>
  </table>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; color: #ffffff;  font-size: 12px;">
   
      
   

  <!-- Course Info Section -->
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;" colspan="2" style="background-color: #4F46E5; color: #ffffff;  font-size: 12px;">Course Info</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">Course Name</td>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">${userData.cousreData}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">Price</td>
    <td style="padding: 8px; border: 1px solid #ddd;  color: #28a745;  font-size: 12px;">₹${userData.payment.amount}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">GST</td>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">0%</td>
  </tr>
  <tr>
    <td style="padding: 8px; border: 1px solid #ddd;  font-size: 12px;">Total</td>
    <td style="padding: 8px; border: 1px solid #ddd;  color: #28a745;  font-size: 12px;">₹${userData.payment.amount}</td>
  </tr>
  <tr>
    <td style="padding: 8px;  font-size: 12px; border: 1px solid #ddd;">Transaction ID</td>
    <td style="padding: 8px; font-size: 12px; border: 1px solid #ddd; ">${userData.payment.payment_id}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-size: 12px; border: 1px solid #ddd;">Payment Method</td>
    <td style="padding: 8px;  font-size: 12px; border: 1px solid #ddd; ">${userData.payment.payment_method}</td>
  </tr>
</table>

  
            <p style="margin: 0 0 20px;  font-size: 12px;">The user has successfully purchased the course and has access.</p>
            <p style="margin: 0;  font-size: 12px;">Best regards,</p>
            <p style="margin: 0;  font-size: 12px;"><strong>StackEarn Team</strong></p>
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
