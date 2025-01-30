module.exports = (userName) => {
  console.log("userName",userName)
  return `
  <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
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
      <td style="padding:40px 0 20px 20px; text-align: left">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;"> Hi 
        <span style="font-weight :bold ; text-transform: uppercase;">
          ${userName.name}
        </span>
        , </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
          Congratulations! 🎉 Your registration with 
          <span style="color : #000fff">
            StackEarn
          </span>
           has been successfully completed.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
          We’re excited to have you onboard and can’t wait for you to explore everything we have to offer.
        </p>
      </td>
    </tr>
   <tr style="margin-top: 10px;">
    <td style="padding: 0 20px 45px 20px; text-align: center;">
  <a href="https://www.its-invite.com/${userName.Webniarrecord._id}" 
     style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: transparent; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉  Go To Dashboard
  </a>
</td>
</tr>

    <tr>
      <td style="padding: 0 0 20px 20px;">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
          If you have any questions or need assistance, feel free to reach out to us:
        </p>
        <p style="margin: 5px 0; font-size: 12px; font-weight: normal; color: #CCCCCC; text-align: left;">
          📧 <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;"><strong>support@stackearn.com</strong></a>
          📞 <a href="tel:+9123445678909"  style="color: #007bff; text-decoration: underline;"><strong>+91 23445678909</strong></a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 45px 20px; text-align: left">
        <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;"> 
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
      <tr style="background-color: #000000; text-align: center;">
          <td style="padding: 10px; font-size: 12px; color: #777777;">
            &copy; 2025 StackEarn. All rights reserved.
          </td>
        </tr>
  </table>
  `;
};