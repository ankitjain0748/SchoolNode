module.exports = {
  apps: [
    {
      name: 'SchoolNode',
      script: './App.js',
      cwd: '/home/ubuntu/SchoolNode',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};


// server {
//   listen 443 ssl;
//   server_name api.stackearn.com;

//   ssl_certificate /etc/letsencrypt/live/api.stackearn.com/fullchain.pem;
//   ssl_certificate_key /etc/letsencrypt/live/api.stackearn.com/privkey.pem;

//   location / {
//       proxy_pass http://127.0.0.1:8000;
//       proxy_http_version 1.1;
//       proxy_set_header Upgrade $http_upgrade;
//       proxy_set_header Connection 'upgrade';
//       proxy_set_header Host $host;
//       proxy_cache_bypass $http_upgrade;
//   }
// }

// server {
//   listen 80;
//   server_name api.stackearn.com;
//   return 301 https://$host$request_uri;
// }