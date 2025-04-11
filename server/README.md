# Garden E-Commerce Stripe Payment Server

This server handles Stripe payment processing for the Garden E-Commerce platform. It provides endpoints for creating payment intents, checkout sessions, and handling webhook events from Stripe.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- A Stripe account (sign up at [stripe.com](https://stripe.com))

## Setup

1. Clone the repository (if you haven't already)
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
4. Create a `.env` file in the server directory with your Stripe credentials:
   ```
   STRIPE_SECRET_KEY=sk_test_your_test_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   PORT=3000
   NODE_ENV=development
   ```

   Replace the placeholder values with your actual Stripe API keys, which you can get from your Stripe dashboard.

5. Start the server:
   ```
   npm start
   ```
   or for development (with auto-reload):
   ```
   npm run dev
   ```

## API Endpoints

### Create Payment Intent

```
POST /api/create-payment-intent
```

Request body:
```json
{
  "amount": 2000, // Amount in cents (e.g., $20.00)
  "currency": "usd", // Optional, defaults to "usd"
  "metadata": {     // Optional metadata for the payment
    "orderId": "123456"
  }
}
```

Response:
```json
{
  "clientSecret": "pi_1234_secret_5678",
  "id": "pi_1234"
}
```

### Create Checkout Session

```
POST /api/create-checkout-session
```

Request body:
```json
{
  "lineItems": [
    {
      "price_data": {
        "currency": "usd",
        "product_data": {
          "name": "Garden Fork",
          "description": "Premium quality garden fork",
          "images": ["https://example.com/fork.jpg"]
        },
        "unit_amount": 1995 // $19.95
      },
      "quantity": 1
    }
  ],
  "successUrl": "https://example.com/success", // Optional
  "cancelUrl": "https://example.com/cancel",   // Optional
  "metadata": {                               // Optional
    "orderId": "123456"
  }
}
```

Response:
```json
{
  "sessionId": "cs_1234567890"
}
```

### Webhook Handler

```
POST /webhook
```

This endpoint handles webhook events from Stripe. The following events are currently handled:

- `payment_intent.succeeded` - When a payment succeeds
- `payment_intent.payment_failed` - When a payment fails
- `checkout.session.completed` - When a checkout session completes

## Stripe Test Cards

For testing payments, you can use the following test cards:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0025 0000 3155
- **Payment declined**: 4000 0000 0000 9995

For all test cards, you can use:
- Any future expiration date
- Any 3-digit CVC
- Any postal code

## Testing Webhooks Locally

To test webhooks locally, you can use the Stripe CLI:

1. Install the Stripe CLI: [instructions](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account:
   ```
   stripe login
   ```
3. Forward webhook events to your local server:
   ```
   stripe listen --forward-to localhost:3000/webhook
   ```
4. The CLI will display a webhook signing secret, which you should set in your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Deployment

For production deployment, consider the following:

1. Set `NODE_ENV=production` in your environment variables
2. Use a proper deployment platform (Heroku, AWS, etc.)
3. Use your live Stripe API keys instead of test keys
4. Set up proper error logging and monitoring
5. Configure a proper webhook URL in your Stripe dashboard

## Security Considerations

- Never expose your Stripe secret key in client-side code
- Always validate inputs on the server
- Use HTTPS for production deployments
- Verify webhook signatures
- Implement proper error handling and logging 