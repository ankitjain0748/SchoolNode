module.exports = (userName) => {
  return `
   <table align="center" style="max-width: 600px; font-family: Arial, sans-serif;" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000" color="#ffffff;">
      <tr bgcolor="#141414">
        <td style="padding: 20px 2px 20px 2px; text-align: center;">
          <p style="margin: 1px;">
            <a href="https://www.stackearn.com/">
              <img style="max-width:200px;" src="https://stacklearnimage.s3.ap-south-1.amazonaws.com/uploads/Adobe+Express+-+file.jpg" alt="">
            </a>
          </p>
        </td>
      </tr>
    
      <tr>
        <td style="padding: 40px 0 20px 20px; text-align: left;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-transform: capitalize;">Hello 
          <strong style="text-transform: uppercase;">
            ${userName?.name},
          </strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
           Your payout has been successfully transferred to your account 🎉 
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
            ✅ Daily Payout:             <span style= "color:#28a745  ;">
               ₹ ${userName.Webniarrecord.payment_key} ${userName.Webniarrecord.payment_income === "passsive" ? "Passive Income" : "Direct Income"}
            </span>
            </p>
        </td>
      </tr>

       <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
          ✅ Transaction ID:         <span style= "color:#28a745  ;">
               ${userName.Webniarrecord.transactionId}
            </span>
            </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; text-align: left;">
       ✅ Date:      <span style= "color:#28a745  ;">
               ${userName.Webniarrecord.payment_date}
            </span>
            </p>
        </td>
      </tr>
      <tr>
         <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;">📢 Promote more courses to increase your earnings!</p>
        </td>
        </tr>
        <tr>
      <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: bold; color:#CCCCCC;">🔽 Your payout will be visible in the dropdown.</p>
        </td>    
        </tr>
        
         <tr>
  <td style="padding: 0 0 20px 20px; text-align: left; white-space: nowrap;">
    <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC; white-space: nowrap;">
      📩 If you have any questions, feel free to contact our support team 
      <a href="mailto:support@stackearn.com" style="color: #007bff; text-decoration: underline;">
        support@stackearn.com
      </a>.
    </p>
  </td>
  </tr>

        <tr>
         
      
    <td style="padding: 0 0 20px 20px;">
          <p style="margin: 1px; font-size: 12px; font-weight: normal; color:#CCCCCC;">Best regards,<br> The StackEarn Team</p>
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
