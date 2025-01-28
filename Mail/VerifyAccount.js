module.exports = (otp, userName) => {
  return `
  <table align="center" style="max-width: 600px; font-family: arial;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
  <tr bgcolor="#141414">
    <td style="padding: 20px 2px 20px 2px; text-align: center;">
      <p style="margin: 1px;">
        <a href="https://www.its-invite.com/">
          <img style="max-width:150px;" src="https://f003.backblazeb2.com/file/Event-management/logo.png" alt="">
        </a>
      </p>
    </td>
  </tr>
  
  <tr>
    <td style="padding:40px 0 20px 20px; text-align: left">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;  text-transform: capitalize;"> Hi ${userName}, </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 20px 20px;">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
Thank you for registering with StackEarn! To complete your registration, please verify your email address by using the OTP (One-Time Password) below:
 </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 30px 20px;">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;"> Your OTP is: <strong>${otp}</strong> </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 20px 20px 20px; text-align: left">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC"> This OTP is valid for 10 minutes. Please do not share this code with anyone. </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 20px 20px; text-align: left">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC"> If you didn’t request this, please ignore this email.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 45px 20px; text-align: left">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC"> Warm regards,
  , <br> The StackEarn Team 🌟</p>
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
  <tr bgcolor="#141414">
    <td style="padding: 15px 0 5px 0;border-top:1px solid #444444">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> Copyright (C) 2025 StackEarn. All rights reserved. </p>
    </td>
  </tr>
  <tr bgcolor="#141414">
    <td style="padding: 0 0 15px 0;">
      <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> You are receiving this email because you requested an OTP for your account verification. </p>
    </td>
  </tr>
  </table>
    `;
};
