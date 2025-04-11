# Razorpay UPI Integration Setup Guide

This guide will help you set up Razorpay for UPI payments (PhonePe, Google Pay, Paytm) in your Garden E-Commerce platform.

## Prerequisites

1. Razorpay account (sign up at [https://razorpay.com](https://razorpay.com))
2. Razorpay API keys (available in your Razorpay Dashboard)
3. Node.js installed on your server

## Setup Steps

### 1. Update API Keys

Open `js/razorpay-config.js` and replace the placeholder API key with your actual Razorpay key:

```javascript
const RazorpayConfig = {
    // Razorpay API Keys
    keyId: 'rzp_test_YOUR_KEY_ID', // Replace with your actual Razorpay key
    // ...
};
```

### 2. Server Setup

#### Install Required Packages

```bash
npm install express body-parser cors razorpay dotenv
```

#### Configure Environment Variables

Create a `.env` file in your server directory:

```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=3001
```

#### Start the Server

```bash
node server/razorpay-server.js
```

### 3. Configure Payment Methods

The payment methods (`phonepay`, `googlepay`, `paytm`) are already configured in the checkout page. Make sure your Razorpay account has UPI payment methods enabled.

## Testing

1. Add items to cart and proceed to checkout
2. Select any UPI payment method (PhonePe, Google Pay, Paytm)
3. Click "Place Order"
4. You should be redirected to the Razorpay checkout page
5. Complete the payment using the test mode

## Production Deployment

For production deployment:

1. Replace test keys with production keys
2. Set up proper SSL for secure transactions
3. Implement additional security measures as recommended by Razorpay

## Troubleshooting

- Check browser console for errors
- Verify API keys are correct
- Ensure the server is running and accessible
- Test with Razorpay test mode before going live

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [UPI Integration Guide](https://razorpay.com/docs/payments/payment-methods/upi/web/) 