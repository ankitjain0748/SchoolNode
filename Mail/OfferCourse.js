module.exports = (userName) => {
  console.log("userName", userName);
  return `
  <head>
    <style>
  ul, ol {
    padding: 0;
    margin: 0;
  }

  li {
    color: #ffffff;
    font-weight: bold;
    margin: 5px 0;
    padding: 10px;
    font-size: 16px;
  }
</style>

    </head>
      <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
  <tr style="width: 100%; max-width: 600px; height: auto;" >
    <td >
   
        <a href="https://www.its-invite.com/">
          <img style="width: 100%; max-width: 600px; height: auto;" src="${userName.BgImage}" alt="New Blog Post">
        </a>
     
    </td>
  </tr>
        <tr>
          <td style="padding: 40px 0 20px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello Users,</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 20px;">
            <p style="margin: 1px 0 20px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              We’re excited to announce an exclusive limited-time offer on our <span style="font-weight: bold; color:#FFFFFF; font-size: 16px;">${userName.Webniarrecord.title}</span>!
            </p>
            <p style="text-align: left; margin-bottom: 20px;">
              <img src="${userName.ImageUrl}" alt="Course Offer Image" style="max-width: 100%; height: auto;"/>
            </p>

            <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>📝 Course Name:</strong> <span style="font-weight: bold; color:#4F46E5;">${userName.Webniarrecord.title}</span>
            </p>
            <p style="margin: 1px 10px 10px 0px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
  <strong style="font-size: 16px; color: #FF5733;">[Discount %] Off:</strong>
  <span style="font-weight: bold; color: #4F46E5; font-size: 18px; padding: 5px 10px; background-color: #FFEB3B; border-radius: 5px;">
    ${userName.dicount} %
  </span>
</p>

            <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>Original Price:</strong> <span style="font-weight: bold; color:#4F46E5;" >₹ ${userName.Webniarrecord.price} </span>
            </p>
            <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>Discounted Price:</strong> <span style="font-weight: bold; color:#4F46E5;" >₹ ${userName.Webniarrecord.discountPrice} </span>
            </p>
            <p style="margin: 1px 0 20px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>🎯 Why You Should Attend:</strong> <span style="font-weight: bold; color:#4F46E5;" > ${userName.SubContent} </span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 45px 20px; text-align: left;">
  <p style="margin: 1px 10px 2px 5px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
    <strong style="margin: 1px 10px 2px 5px;">🔗  Enroll Now:</strong><br>
    <a href="https://www.its-invite.com/${userName.Webniarrecord._id}" 
       style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: #4F46E5; color: white; font-size: 16px; text-decoration: none; border-radius: 5px; text-align: center;">
      Enroll Now
    </a>
  </p>
</td>

        </tr>
       <tr>
  <td style="padding: 0 0 45px 20px; text-align: left;">
    <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC;">
      This offer won’t last long, so make sure to grab it before it’s gone! If you have any questions or need help, feel free to reach out to us at 
      <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;">support@stackearn.com</a>.
    </p>
  </td>
</tr>

        <tr>
          <td style="padding: 0 0 45px 20px; text-align: left;">
            <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC;">
             Best regards,
             <br/>
             StackEarn Team
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
            <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> Copyright (C) 2025 StackEarn. All rights reserved. </p>
          </td>
        </tr>
        <tr bgcolor="#141414">
          <td style="padding: 0 0 15px 0;">
            <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: center;"> You are receiving this email because you subscribed to our newsletter. </p>
          </td>
        </tr>
      </table>
    `;
};
