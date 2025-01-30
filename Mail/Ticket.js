module.exports = (support) => {
  return `
    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff">
      <tr bgcolor="#141414">
        <td style="padding: 20px 2px 20px 2px; text-align: center;">
          <p style="margin: 1px;">
            <a href="https://www.its-invite.com/">
              <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/applogo.png" alt="">
            </a>
          </p>
        </td>
      </tr>
   
      <tr>
        <td style="padding: 40px 0 20px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello 
          <span style="text-transform:uppercase; font-weight:bold;">
            ${support.support?.name}
          </span>
          ,</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
            Thank you for reaching out! We’ve received your support ticket regarding your issue with <strong style="color :#000fff ;">${support.support.message}</strong>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 2px 2px 2px 2px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left; padding:2px 2px  2px 2px;">
            Here are your ticket details:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; color:#fff;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Ticket ID:</td>
              <td style="padding: 8px; border: 1px solid #ddd; ">${support.support._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Issue Description:</td>
              <td style="padding: 8px; border: 1px solid #ddd; ">${support.support.message}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">Submitted On:</td>
              <td style="padding: 8px; border: 1px solid #ddd;  color: #ffffff;">${support.support.created_at}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
  <td style="padding: 0 0 45px 20px; text-align: left;">
    <ul style="list-style-type: disc; padding-left: 20px; color: #CCCCCC;">
      <li style="font-size: 12px; font-weight: normal;">
        Our support team will review your ticket and get back to you as soon as possible.
      </li>
      <li style="font-size: 12px; font-weight: normal; margin-top :10px ;">
        If you have additional details or need further assistance, feel free to reply to this email.
      </li>
    </ul>
  </td>
</tr>

      <tr>
        <td style="padding: 0 0 45px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;">Best regards,<br> The StackEarn Support Team</p>
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
      <tr style="background-color: #000000; text-align: center;">
        <td style="padding: 10px; font-size: 12px; color: #777777;">
          &copy; 2025 StackEarn. All rights reserved.
        </td>
      </tr>
    </table>
  `;
};
