/**
 * Razorpay Server Integration for Garden E-Commerce
 * Handles Razorpay payment processing endpoints
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('Razorpay initialized with key ID:', process.env.RAZORPAY_KEY_ID);

/**
 * Simple test endpoint to verify server is running
 * GET /api/razorpay/test
 */
app.get('/api/razorpay/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({
        success: true,
        message: 'Razorpay server is running correctly',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Create a Razorpay order for UPI and other payment methods
 * POST /api/razorpay/create-order
 */
app.post('/api/razorpay/create-order', async (req, res) => {
    console.log('Create order endpoint called with body:', req.body);
    
    try {
        const { amount, currency = 'INR', receipt, notes = {} } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid amount' 
            });
        }
        
        // Create order options
        const options = {
            amount: Math.round(amount * 100), // Convert to paise/cents
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes
        };
        
        console.log('Creating order with options:', options);
        
        const order = await razorpay.orders.create(options);
        console.log('Order created successfully:', order);
        
        // Return order details
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

/**
 * Verify a Razorpay payment
 * POST /api/razorpay/verify-payment
 */
app.post('/api/razorpay/verify-payment', (req, res) => {
    console.log('Verify payment endpoint called with body:', req.body);
    
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('Missing required payment verification fields');
            return res.status(400).json({ 
                success: false,
                error: 'Missing required payment verification fields' 
            });
        }
        
        // Create the signature to verify the payment
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        
        console.log('Signature verification: generated vs received');
        console.log('Generated:', generatedSignature);
        console.log('Received:', razorpay_signature);
        
        // Verify signature
        if (generatedSignature === razorpay_signature) {
            console.log('Payment verified successfully');
            res.json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            console.error('Invalid signature');
            res.status(400).json({
                success: false,
                error: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Handle 404 errors
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server for local development
app.listen(PORT, () => {
    console.log(`Razorpay server running on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}/api/razorpay/test`);
});

module.exports = app; 