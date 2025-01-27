module.exports = (userName) => {
    return `
        <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
          <tr bgcolor="#141414">
            <td style="padding: 20px 2px 0 2px; text-align: center;">
              <p style="margin: 1px;">
                <a href="https://www.its-invite.com/">
                  <img style="max-width:150px;" src="https://f003.backblazeb2.com/file/Event-management/logo.png" alt="">
                </a>
              </p>
            </td>
          </tr>
          <tr bgcolor="#141414">
            <td style="padding: 40px 2px 10px 2px; text-align: center;">
              <p style="margin: 1px;">
                <img src="https://f003.backblazeb2.com/file/Event-management/new_blog.png" alt="New Blog Post">
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0 20px 20px; text-align: left;">
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello Users,</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 20px 20px;">
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
              We’re excited to invite you to our upcoming event/webinar!📖
              </p>
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
                <strong>📅 Event/Webinar Title:</strong> ${userName.Webniarrecord.title}
              </p>
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
                <strong>🗓 Date & Time:</strong> ${userName.Webniarrecord.webnair_date} & ${userName.Webniarrecord.webnair_time}
              </p>
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
                <strong>📍 Location:</strong> ${userName.Webniarrecord.place}
              </p>
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
                <strong>🔍 About the Event:</strong> ${userName.Webniarrecord.content}
              </p>
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#ffffff; text-align: left;">
                <strong>🎯 Why You Should Attend:</strong> ${userName.message}
              </p>
              
            </td>
          </tr>
          <tr>
         <td style="padding: 0 0 45px 20px; text-align: left;">
      <p style="margin: 1px 10px 2px 5px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
        <strong style="margin: 1px 10px 2px 5px;">🔗  Register Now:</strong><br>
        <a href="https://www.its-invite.com/${userName.Webniarrecord._id}" style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: #007bff; color: white; font-size: 16px; text-decoration: none; border-radius: 5px; text-align: center;">Click here to register or visit </a>
      </p>
    </td>
    
          </tr>
          <tr>
            <td style="padding: 0 0 45px 20px; text-align: left;">
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
        We hope to see you there! If you have any questions or need further details, feel free to reach out to us at 
            <a href="mailto:support@stackearn.com" style="color: #ffffff; text-decoration: none;">support@stackearn.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 0 45px 20px; text-align: left;">
              <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
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
                      <img src="https://f003.backblazeb2.com/file/Event-management/linkedicon.png" alt="">
                    </a>
                  </td>
                  <td style="padding: 0 5px;">
                    <a href="https://www.instagram.com/itsinvite_/" target="_blank">
                      <img src="https://f003.backblazeb2.com/file/Event-management/instagram.png" alt="">
                    </a>
                  </td>
                  <td style="padding: 0 5px;">
                    <a href="https://www.tiktok.com/(at_the_rate)itsinvite_" target="_blank">
                      <img src="https://f003.backblazeb2.com/file/Event-management/ri_tiktok-line.png" alt="">
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
  