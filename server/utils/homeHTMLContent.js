const homeHTMLContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WorkIQ</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        p {
          color: #666;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          background-color: #e7e7e7;
          margin: 5px 0;
          padding: 10px;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to WorkIQ</h1>
        <p>A comprehensive freelancing platform featuring:</p>
        <ul>
          <li>Wide Range of Talented Freelancers</li>
          <li>Project Listings</li>
          <li>Secure Escrow Payments</li>
          <li>Messaging System</li>
          <li>And Lots More</li>
        </ul>
      </div>
    </body>
    </html>
  `;

module.exports = homeHTMLContent;
