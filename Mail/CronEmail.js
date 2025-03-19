module.exports = (userName) => {
    return `
   <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #0367F7;
            color: white;
            text-align: center;
            padding: 10px;
            font-size: 24px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .content {
            padding: 20px;
            text-align: center;
            font-size: 16px;
            color: #333;
        }
        .footer {
            background: #eee;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
        }
        .button {
            display: inline-block;
            background: #0367F7;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .button:hover {
            background: #024abd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            📩 Cron Job Notification
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your daily cron job has been successfully completed.</p>
          <p><strong>Date:</strong> ${new Date()}</p>
            <p><strong>Status:</strong> ✅ Successful The daily payment reset job has been successfully completed at midnight.</p>
        </div>
        <div class="footer">
            &copy; 2024 Your Company. All rights reserved.
        </div>
    </div>
</body>
</html>
      `;
};
