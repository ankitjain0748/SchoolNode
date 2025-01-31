module.exports = (userData) => {
  const userEmail = userData?.datauser?.email || 'N/A';
  const userMobile = `${userData?.datauser?.phone_code || '+91'} ${userData?.datauser?.phone_number || 'N/A'}`;
  const registrationDate = userData?.datauser?.created_at || 'N/A';

  return `
    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff">
      <tr bgcolor="#141414">
        <td style="padding: 20px 2px 20px 2px; text-align: center;">
          <p style="margin: 1px;">
            <a href="https://www.stackearn.com/">
              <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/Adobe+Express+-+file.jpg" alt="StackEarn">
            </a>
          </p>
        </td>
      </tr>
     
     
      <tr>
        <td style="padding: 20px; color: #ffffff;">
          <p style="margin: 0 0 20px;">Hello Admin,</p>
          <p style="margin: 0 0 20px;">
            A new user has successfully registered on <span style="color : #007bff">StackEarn</span>. Below are their details:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">Name:</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">${userData?.datauser?.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <a href="mailto:${userEmail}" style="color: #000fff; text-decoration: none;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">Mobile:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                <a href="tel:${userMobile}" style="color: #ffffff; text-decoration: none;">${userMobile}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">Date of Registration:</td>
              <td style="padding: 8px; border: 1px solid #ddd; color: #ffffff;">${registrationDate}</td>
            </tr>
          </table>
          <p style="margin: 0 0 20px; color: #ffffff;">
            You can view more details in the admin panel.
          </p>
          <p style="margin: 0; color: #ffffff;">Best regards,</p>
          <p style="margin: 0; color: #ffffff;">StackEarn Notification System</p>
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
