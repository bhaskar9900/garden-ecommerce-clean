# My Culture Garden E-Commerce Platform

A beautiful e-commerce platform for garden products with Razorpay UPI payment integration.

## Features

- Modern and responsive UI
- Shopping cart functionality
- Checkout process
- UPI payment integration with Razorpay (PhonePe, Google Pay, Paytm)
- Order confirmation and tracking

## Tech Stack

- HTML/CSS/JavaScript (Frontend)
- Node.js/Express (Backend for Razorpay integration)
- Razorpay API for payment processing

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/garden-ecommerce.git
   cd garden-ecommerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   PORT=3001
   ```

4. Start the Razorpay server:
   ```
   node server/razorpay-server.js
   ```

5. Open the website:
   Open `index.html` in your browser or use a local server to serve the static files.

## Testing Payments

For testing purposes, you can use these Razorpay test credentials:
- Test UPI ID: `success@razorpay`
- Any other information can be dummy data

## License

MIT 