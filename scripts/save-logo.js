const fs = require('fs');
const path = require('path');

// Create the directories if they don't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple HTML that instructs the user to save the logo
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Save ETH Cali Logo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    .instructions {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
      text-align: left;
    }
    h1 {
      color: #4B66F3;
    }
  </style>
</head>
<body>
  <h1>ETH Cali Logo Setup</h1>
  
  <div class="instructions">
    <h2>Instructions:</h2>
    <ol>
      <li>Save the ETH Cali logo from the chat to <strong>papayapp/public/logo_eth_cali.png</strong></li>
      <li>Then run <code>npm run dev</code> to start the application</li>
    </ol>
  </div>
  
  <p>The application is configured to use the logo at <code>/logo_eth_cali.png</code></p>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(publicDir, 'logo-instructions.html'), htmlContent);

console.log('Instructions saved to public/logo-instructions.html');
console.log('Please save the ETH Cali logo to public/logo_eth_cali.png'); 