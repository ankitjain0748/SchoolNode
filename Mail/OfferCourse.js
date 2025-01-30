module.exports = (userName) => {
  console.log("userName", userName);
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
   
        <a href="https://www.its-invite.com/">
          <img style="width: 100%; max-width: 600px; height: auto; object-fit: cover;" src="${userName.BgImage}" alt="New Blog Post">
        </a>
     
    </td>
  </tr>
        <tr>
          <td style="padding: 40px 0 20px 20px; text-align: left;">
            <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello User,</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 20px;">
            <p style="margin: 1px 0 20px 0; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
             Exciting news! Enroll in <span style=" color:#28a745; font-size: 12px; text-transform:capitalize ;">${userName.Webniarrecord.title}</span>  now and get  <span style=" color:#fd7e14; font-size: 12px;">    ${userName.dicount} % OFF</span>   for a limited time. Whether you're upskilling or starting fresh, this course is designed for you!

            </p>
            <p style="text-align: left; margin-bottom: 20px;">
              <img src="${userName.ImageUrl}" alt="Course Offer Image" style="max-width: 100%; height: auto;"/>
            </p>
            
           <p style="margin: 1px 0 0px 0; font-size: 12px; font-weight: bold; color:#CCCCCC; text-align: left;">
             🌟 Why Join? 
<ul>
  <li> <strong>✔ In-Depth Learning– </strong> Master [Key Topic] with expert guidance.</li>
  <li><strong>
    ✔ Flexible & Self-Paced–
  </strong> Learn anytime, anywhere.</li>
  <li>
    <strong>
      ✔ Exclusive Resources –
    </strong> Gain access to bonus materials.</li>
</ul>

            </p>

 
       

            <p style="margin: 1px 0 0px 0; font-size: 14px; font-weight: bold; color:#CCCCCC; text-align: left;">
💥 Special Offer:
            </p>
            <p style="margin: 1px 0 10px 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
            <strong>
              Original Price: <span style="font-weight: normal; color:#28a745;" >₹ ${userName.Webniarrecord.price} </span> 
            </strong>
            
              <strong> → Now:</strong> <span style="font-weight: normal; color:#28a745;" >₹ ${userName.Webniarrecord.discountPrice} </span>
            </p>
            <p style="margin: 1px 0 20px 0; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
              <strong>⏳ Offer Ends Soon! Don’t miss out!</strong>             </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 20px 20px 20px; text-align: center;">
  <a href="https://www.its-invite.com/${userName.Webniarrecord._id}" 
     style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: transparent; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉 Enroll Now
  </a>
</td>

        </tr>
       <tr>
  <td style="padding: 0 0 45px 20px; text-align: left;">
    <p style="margin: 1px 0 10px 0; font-size: 12px; font-weight: normal; color:#CCCCCC;">
Need help? Contact us at 
      <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;">support@stackearn.com</a>
    </p>
  </td>
</tr>

        <tr>
          <td style="padding: 0 0 45px 20px; text-align: left;">
            <p style="margin: 1px 0 10px 0; font-size: 12px; font-weight: normal; color:#CCCCCC;">
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
      <tr style="background-color: #000000; text-align: center;">
          <td style="padding: 10px; font-size: 12px; color: #777777;">
            &copy; 2025 StackEarn. All rights reserved.
          </td>
        </tr>
      </table>
    `;
};
