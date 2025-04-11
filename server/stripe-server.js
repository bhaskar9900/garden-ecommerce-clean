/**
 * Stripe Server Integration for Garden E-Commerce
 * Handles Stripe payment processing endpoints
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Stripe payment server running' });
});

/**
 * Test endpoint
 * GET /api/stripe/test
 */
app.get('/api/stripe/test', (req, res) => {
    res.json({
        success: true,
        message: 'Stripe server is running correctly',
        timestamp: new Date().toISOString()
    });
});

/**
 * Create a payment intent
 * POST /api/stripe/create-payment-intent
 */
app.post('/api/stripe/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', description } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid amount' 
            });
        }
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            description,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                integration_check: 'garden_e_commerce_integration'
            }
        });
        
        // Return client secret
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * Create a checkout session
 * POST /api/stripe/create-checkout-session
 */
app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
        const { lineItems, successUrl, cancelUrl } = req.body;
        
        // Validate parameters
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or missing line items' 
            });
        }
        
        if (!successUrl || !cancelUrl) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing success or cancel URLs' 
            });
        }
        
        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl
        });
        
        // Return session ID
        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * Handle webhook events
 * POST /api/stripe/webhook
 */
app.post('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        // Handle event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment intent succeeded:', paymentIntent.id);
                // Handle successful payment
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                // Handle failed payment
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Stripe server running on port ${PORT}`);
});

module.exports = app; 