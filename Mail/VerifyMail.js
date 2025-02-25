module.exports = ( userName, verificationLink) => {
    return `
    <table align="center" style="max-width: 600px; font-family: arial;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
    <tr bgcolor="#141414">
      <td style="padding: 20px 2px 20px 2px; text-align: center;">
        <p style="margin: 1px;">
          <a href="https://www.stackearn.com/">
            <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/Adobe+Express+-+file.jpg" alt="">
          </a>
        </p>
      </td>
    </tr>
    
    <tr>
      <td style="padding:40px 0 20px 20px; text-align: left">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;"> Hi ${userName}, </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
  Thank you for registering with 
  <span style="color: #007bff;">StackEarn!</span>
   To complete your registration, please verify your email address by using the verify account link below:
   </p>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 0 20px 20px 20px; text-align: left">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC"> If you need to verify your account, click the link below: </p>
      </td>
    </tr>
  
    <tr>
      <td style="padding: 20px; text-align: center;">
        <a href="${verificationLink}" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px; display: inline-block;">
          Verify Your Account
        </a>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 0 0 45px 20px; text-align: left">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC"> Warm regards,<br> The StackEarn Team 🌟</p>
      </td>
    </tr>
    
    <tr bgcolor="#141414">
      <td style="padding: 15px 0 15px 0; text-align: center;">
        <table cellpadding="0" cellspacing="0" align="center">
          <tr>
              <td style="padding: 0 5px;">
                <a href="https://www.linkedin.com/company/itsinvite" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/linkedicon.png" alt="LinkedIn">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://www.instagram.com/itsinvite_/" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/instagram.png" alt="Instagram">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://twitter.com/itsinvite_" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/twitter.png" alt="Twitter">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://www.facebook.com/itsinvite" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/facebook.png" alt="Facebook">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://www.youtube.com/@itsinvite" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/youtube.png" alt="YouTube">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://t.me/itsinvite" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/telegram.png" alt="Telegram">
                </a>
              </td>
          </tr>
        </table>
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
  