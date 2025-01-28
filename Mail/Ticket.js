module.exports = (support) => {
  return `
    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff">
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
        <td style="padding: 40px 0 20px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello 
          <span style="text-transform:capitalize; font-weight:bold;">
            ${support.support?.name}
          </span>
          ,</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
            Thank you for reaching out! We’ve received your support ticket regarding your issue with <strong>${support.support.message}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 2px 2px 2px 2px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left; padding:2px 2px  2px 2px;">
            Here are your ticket details:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; color:#fff;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Ticket ID:</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${support.support._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Issue Description:</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${support.support.message}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Submitted On:</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #ffffff;">${support.support.created_at}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 45px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
            Our support team will review your ticket and get back to you as soon as possible. We’re here to help!
          </p>
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
            If you have additional details or need further assistance, feel free to reply to this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 45px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">Best regards,<br> The StackEarn Support Team</p>
        </td>
      </tr>
      <tr bgcolor="#141414">
        <td style="padding: 15px 0 15px 0; text-align: left;">
          <table cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td style="padding: 0 5px;">
                <a href="https://www.linkedin.com/company/itsinvite" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/linkedicon.png" alt="">
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a href="https://www.instagram.com/itsinvite_/" target="_blank">
                  <img src="https://f003.backblazeb2.com/file/Event-management/instagram.png" alt="">
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
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> Copyright (C) 2025 StackEarn. All rights reserved. </p>
        </td>
      </tr>
      <tr bgcolor="#141414">
        <td style="padding: 0 0 15px 0;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> You are receiving this email because you submitted a support ticket. </p>
        </td>
      </tr>
    </table>
  `;
};
