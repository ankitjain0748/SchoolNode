module.exports = (userName) => {
  return `
      <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;"  border="0" cellspacing="0" cellpadding="0" bgcolor="#000">
        <tr bgcolor="#141414">
          <td style="padding: 20px 2px 20px 2px; text-align: center;">
            <p style="margin: 1px;">
              <a href="https://www.stackearn.com/">
                <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/Adobe+Express+-+file.jpg" alt="Logo">
              </a>
            </p>
          </td>
        </tr>
       
        <tr>
          <td style="padding: 40px 0 20px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello User,</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 20px;">
         <p style="margin: 10px 0 15px 0; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
    We’re excited to share that a new blog post has just been published! 📖
</p>
<p style="margin: 10px 0 15px 0; font-size: 12px;  color:#ffffff; text-align: left;">
   
     Blog Post Title: 
     
     <br/>
     
         <span style=" color:#28a745; margin-top:5px;">${userName.BlogRecord.title}</span>
    
</p>


<p style="margin: 10px 0 20px 0; font-size: 12px;  color:#FFFFFF; text-align: left;">
    Blog Post Description: 
    <br>
     <span style="font-weight: normal; color:#28a745;  margin-top:5px;">${userName.BlogRecord.short_content}</span>
</p>


          </td>
        </tr>
            </tr>
         <tr style="margin-top: 10px;">
    <td style="padding: 0 20px 45px 20px; text-align: center;">
  <a href="https://www.its-invite.com/blog-details/${userName.BlogRecord._id}" 
     style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: transparent; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉  Full Blog Post
  </a>
</td>
</tr>
        <tr>
          <td style="padding: 0 0 45px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;">
              We hope you find this post helpful and engaging! If you have any questions, feel free to get in touch with us at <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: none;">support@stackearn.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 45px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;">
              Stay tuned for more updates, <br/>
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
        <tr style="background-color: #000000; text-align: center;">
          <td style="padding: 10px; font-size: 12px; color: #777777;">
            &copy; 2025 StackEarn. All rights reserved.
          </td>
        </tr>
        
      </table>
    `;
};
