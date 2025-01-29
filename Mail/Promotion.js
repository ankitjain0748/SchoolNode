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
   
        <a href="https://www.its-invite.com/">
          <img style="width: 100%; max-width: 600px; height: auto; object-fit: cover;" src="${userName.BgImage}" alt="">
        </a>
     
    </td>
  </tr>
   
      <tr>
        <td style="padding: 20px 20px 10px 20px; text-align: left;">
          <p style="margin: 0; font-size: 14px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello User,</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 20px 20px 20px;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
 We’re excited to offer <span style=" color:#fd7e14;" > ${userName.dicount}% OFF</span>  on our <strong style="color : #28a745">${userName.Webniarrecord.title}?</strong> course! Gain in-depth knowledge, expert guidance, and flexible learning—all at a discounted price!
          </p>
         
          
             <p style="margin: 5px; padding: 10px 0px 10px 10px; font-size: 14px; font-weight: bold; color:#CCCCCC; text-align: left;">
             💡 What’s in it for you?
<ul>
  <li> <strong>✅ Master key skills for the </strong> <span>${userName.Webniarrecord.title} </span> </ li>
  <li>
  <strong>
    ✔ Flexible & Self-Paced–
  </strong> Learn anytime, anywhere.</li>
  <li>
    <strong>
      ✔ Exclusive Resources –
    </strong> Gain access to bonus materials.</li>
</ul>

            </p>


  
          
          <p style="margin-bottom: 10px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
            <strong>🎉 Special Price:</strong>  <span style=" color:#28a745; font-weight:bold ;" > ₹  ${userName.Webniarrecord.discountPrice} </span>(Original ₹${userName.Webniarrecord.price} )
          </p>
          
          <p style="margin-bottom: 10px; font-size: 14px; font-weight: normal; color:#CCCCCC; text-align: left;">
          📅 Offer Ends Soon!
          </p>
          
        </td>
      </tr>

     
      <tr>
 <td style="padding: 0 20px 45px 20px; text-align: center;">
  <a href="https://www.its-invite.com/${userName.Webniarrecord._id}" 
     style="display: inline-block; margin: 10px 10px; padding: 12px 20px; background-color: transparent; color: #ffffff; font-size: 16px; text-decoration: none; border-radius: 5px; border: 2px solid #28a745; text-align: center;">
    👉 Enroll Now
  </a>
</td>


      </tr>
      <tr>
        <td style="padding: 0 20px 45px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 14px; font-weight: normal; color:#CCCCCC;">
     For any queries, reach out to 
           <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;">support@stackearn.com</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 20px 45px 20px; text-align: left;">
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
