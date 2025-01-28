module.exports = (userName) => {
  return `
  <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
    <tr bgcolor="#141414">
      <td style="padding: 20px 2px 20px 2px; text-align: center;">
        <p style="margin: 1px;">
          <a href="https://www.its-invite.com/">
            <img style="max-width:150px;" src="https://f003.backblazeb2.com/file/Event-management/logo.png" alt="StackEarn Logo">
          </a>
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding:40px 0 20px 20px; text-align: left">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;"> Hi 
        <span style="font-weight :bold ; text-transform: capitalize;">
          ${userName}
        </span>
        , </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
          Congratulations! 🎉 Your registration with StackEarn has been successfully completed.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
          We’re excited to have you onboard and can’t wait for you to explore everything we have to offer.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 0 20px 20px; text-align: center;">
        <a href="https://www.stackearn.com/dashboard" style="display: inline-block; padding: 8px 16px; font-size: 13px; font-weight: bold; text-decoration: none; background-color: #007bff; color: #ffffff; border-radius: 5px;">Go to Dashboard</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
          If you have any questions or need assistance, feel free to reach out to us:
        </p>
        <p style="margin: 5px 0; font-size: 14px; font-weight: normal; color: #CCCCCC; text-align: left;">
          📧 <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;"><strong>support@stackearn.com</strong></a>
          📞 <a href="tel:+9123445678909"  style="color: #007bff; text-decoration: underline;"><strong>+91 23445678909</strong></a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 45px 20px; text-align: left">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;"> 
          Thank you for choosing StackEarn. We’re here to support you every step of the way.
        </p>
      </td>
    </tr>
      <tr bgcolor="#141414">
      <td style="padding: 15px 0 15px 0; text-align: left;">
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
              <a href="https://www.facebook.com/itsinvite" target="_blank">
                <img src="https://f003.backblazeb2.com/file/Event-management/facebook.png" alt="Facebook">
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr bgcolor="#141414">
      <td style="padding: 15px 0 5px 0;border-top:1px solid #444444">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> 
          Copyright (C) 2025 StackEarn. All rights reserved. 
        </p>
      </td>
    </tr>
    <tr bgcolor="#141414">
      <td style="padding: 0 0 15px 0;">
        <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> 
          You are receiving this email as part of your account setup process. 
        </p>
      </td>
    </tr>
  </table>
  `;
};
