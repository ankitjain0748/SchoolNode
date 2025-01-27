module.exports = (userData) => {
  const userEmail = userData?.datauser?.email || 'N/A';
  const userMobile = `${userData?.datauser?.phone_code || '+91'} ${userData?.datauser?.phone_number || 'N/A'}`;
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
              <img src="https://f003.backblazeb2.com/file/Event-management/forgetpass.png" alt="Purchase Success Image">
            </p>
          </td>
        </tr>
       
        <tr>
          <td style="padding: 20px; color: #ffffff;">
            <p style="margin: 0 0 20px;">Hello Admin,</p>
            <p style="margin: 0 0 20px;">
              A new purchase has been made. Here are the details:
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd; color: #ffffff;">
             <tr style="background-color: #444444; font-weight: bold;">
    <td style="padding: 8px; border: 1px solid #ddd;" colspan="2">User Info</td>
  </tr>
  
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Name</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userData?.datauser?.name}</td>
              </tr>
              <tr style="background-color: #444444;">
                <td style="padding: 8px; border: 1px solid #ddd;">Email</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <a href="mailto:${userEmail}" style="color: #ffffff; text-decoration: none;">${userEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Phone</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                  <a href="tel:${userMobile}" style="color: #ffffff; text-decoration: none;">${userMobile}</a>
                </td>
              </tr>
              <tr style="background-color: #444444; font-weight: bold;">
                <td style="padding: 8px; border: 1px solid #ddd;"  colspan="2">Course Info</td>
              
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Course Name</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userData.cousreData}</td>
              </tr>
              <tr style="background-color: #444444;">
                <td style="padding: 8px; border: 1px solid #ddd;">Price</td>
                <td style="padding: 8px; border: 1px solid #ddd;">₹${userData.payment.amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">GST</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${"0%"}</td>
              </tr>
              <tr style="background-color: #444444;">
                <td style="padding: 8px; border: 1px solid #ddd;">Total</td>
                <td style="padding: 8px; border: 1px solid #ddd;">₹${userData.payment.amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Transaction ID</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userData.payment.payment_id}</td>
              </tr>
              <tr style="background-color: #444444;">
                <td style="padding: 8px; border: 1px solid #ddd;">Payment Method</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${userData.payment.payment_method}</td>
              </tr>
            </table>
  
            <p style="margin: 0 0 20px;">The user has successfully purchased the course and has access.</p>
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
