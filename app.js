const express = require('express');
const app = express();
const PORT = 3000;

// --- Update this version number every time you deploy ---
const VERSION = "Hello I am Tony"; 

app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Random Static Page</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to the Random Page</h1>
        <p>This is a simple static page with random content.</p>
        <p>Random number: ${Math.floor(Math.random() * 100)}</p>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// A simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});