module.exports = (userName) => {
  return `
  <head>
   <style>
  ul, ol {
    padding:  10px ;
    margin: 0;
  }

  li {
    color: #ffffff;
  margin: 5px;
    font-size: 12px;
  }
</style>
  </head>

    <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
  <tr style="width: 100%; max-width: 600px; height: auto;" >
    <td >
   
        <a href="https://www.stackearn.com/">
          <img style="width: 100%; max-width: 600px; height: auto; object-fit: cover;" src="${userName.BgImage}" alt="New Blog Post">
        </a>
     
    </td>
  </tr>

        <tr >
          <td style="padding: 20px 0 20px 20px; text-align: left;">
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello User,</p>
          </td>
        </tr>
        <tr style="margin-top: 10px; margin-bottom: 10px;">
          <td style="padding: 0 0 20px 20px;">
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-align: left;">
           We’re excited to invite you to our upcoming webinar!
            </p>
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>📅 Event/Webinar Title:</strong> <span style=" color:#28a745;" > ${userName.Webniarrecord.title} </span>
            </p>
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>🗓 Date & Time:</strong> <span style=" color:#28a745;" > ${userName.Webniarrecord.webnair_date} & ${userName.Webniarrecord.webnair_time} </span>
            </p>
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>📍 Location:</strong> <span style="color:#28a745;" > ${userName.Webniarrecord.place} </span>
            </p>
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>🔍 About the Event:</strong> <span style=" color:#28a745;" > ${userName.Webniarrecord.content} </span>
            </p>
            <p style="margin: 1px; margin-top: 10px; margin-bottom: 10px; font-size: 12px;  font-weight: normal; color:#ffffff; text-align: left;">
              <strong>🎯 Why You Should Attend:</strong> <span style=" color:#28a745;" > ${userName.message} </span>
            </p>
          </td>
        </tr>
       <tr style="margin-top: 10px;">
   <td style="padding: 0 20px 20px 20px; text-align: center;">
  <a href="https://www.stackearn.com/event" 
     style="display: inline-block; padding: 10px 10px; background-color: transparent; color: #ffffff; font-size: 12px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉 Join Now
  </a>
</td>
</tr>

        <tr >
          <td style="padding: 0 0 20px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 12px;  font-weight: normal; color:#CCCCCC;">
Don’t miss out! Feel free to reach out to 
           <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;"> support@stackearn.com</a>.
            </p>
          </td>
        </tr>
        <tr style="">
          <td style="padding: 0 0 20px 20px; text-align: left;">
            <p style="margin: 1px;  font-size: 12px;  font-weight: normal; color:#CCCCCC;">
             Best regards,
             <br/>
             StackEarn Team
            </p>
          </td>
        </tr>
        <tr bgcolor="#141414" style="margin-top: 10px; margin-bottom: 10px;">
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
          <tr style="background-color: #000000; text-align: center;">
        <td style="padding: 10px; font-size: 12px;   color: #777777;">
          &copy; 2025 StackEarn. All rights reserved.
        </td>
      </tr>
      </table>
    `;
};