/**
 * Stripe Integration Configuration for Garden E-Commerce Platform
 * This file handles Stripe payment processing integration
 */

// Stripe Configuration
const StripeConfig = {
    // Stripe API key - replace with your actual publishable key for production
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
    
    // API endpoints
    endpoints: {
        createPaymentIntent: '/api/stripe/create-payment-intent',
        createCheckoutSession: '/api/stripe/create-checkout-session',
        createSubscription: '/api/stripe/create-subscription'
    },
    
    // Default options
    defaultOptions: {
        currency: 'usd',
        allowedPaymentMethods: ['card']
    },
    
    // Mode: 'test' or 'live'
    mode: 'test',
    
    // Webhook secret for verifying webhook events
    webhookSecret: 'whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    
    // Payment methods to accept
    paymentMethods: ['card', 'alipay', 'ideal', 'sepa_debit'],
    
    // Currency (default to USD)
    currency: 'USD',
    
    // Country (default to US)
    country: 'US',
    
    // Appearance options for Stripe Elements
    appearance: {
        theme: 'stripe',
        variables: {
            colorPrimary: '#4CAF50',
            colorBackground: '#ffffff',
            colorText: '#424770',
            colorDanger: '#ff5252',
            fontFamily: 'Poppins, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '4px'
        }
    },
    
    // Redirect URLs after payment
    redirects: {
        success: '/confirmation.html',
        cancel: '/checkout.html'
    }
};

// Get current Stripe API key based on mode
function getStripeKey(type = 'publishable') {
    const mode = StripeConfig.mode; // 'test' or 'live'
    return StripeConfig.apiKeys[mode][type];
}

// Stripe API Helper
const StripeAPI = {
    /**
     * Initialize Stripe
     * @returns {Promise<Stripe>} Stripe instance
     */
    init: async function() {
        try {
            if (!window.Stripe) {
                console.error('Stripe.js is not loaded');
                return null;
            }
            
            return window.Stripe(StripeConfig.publishableKey);
        } catch (error) {
            console.error('Error initializing Stripe:', error);
            return null;
        }
    },
    
    /**
     * Create a payment intent
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} Payment intent response
     */
    createPaymentIntent: async function(paymentData) {
        try {
            const response = await fetch(StripeConfig.endpoints.createPaymentIntent, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment intent');
            }
            
            return data;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    },
    
    // Initialize Stripe Elements
    initElements: function(stripe, options = {}) {
        if (!stripe) {
            console.error('Stripe not initialized');
            return null;
        }
        
        const elementsOptions = {
            appearance: StripeConfig.appearance,
            ...options
        };
        
        return stripe.elements(elementsOptions);
    },
    
    // Create a card element
    createCardElement: function(elements, options = {}) {
        if (!elements) {
            console.error('Elements not initialized');
            return null;
        }
        
        const cardOptions = {
            style: {
                base: {
                    color: '#32325d',
                    fontFamily: 'Poppins, Arial, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            },
            ...options
        };
        
        return elements.create('card', cardOptions);
    },
    
    // Create a payment element (new unified Stripe Element)
    createPaymentElement: function(elements, paymentIntentClientSecret, options = {}) {
        if (!elements) {
            console.error('Elements not initialized');
            return null;
        }
        
        const paymentElementOptions = {
            layout: {
                type: 'tabs',
                defaultCollapsed: false
            },
            ...options
        };
        
        return elements.create('payment', paymentElementOptions);
    },
    
    // Process a payment
    processPayment: async function(stripe, elements, clientSecret) {
        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + StripeConfig.redirects.success,
                },
                redirect: 'if_required'
            });
            
            if (result.error) {
                throw result.error;
            }
            
            return { success: true, paymentIntent: result.paymentIntent };
        } catch (error) {
            console.error('Error processing payment:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Create a checkout session
     * @param {Object} sessionData - Checkout session data
     * @returns {Promise<Object>} Checkout session response
     */
    createCheckoutSession: async function(sessionData) {
        try {
            const response = await fetch(StripeConfig.endpoints.createCheckoutSession, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }
            
            return data;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    },
    
    /**
     * Redirect to Stripe Checkout
     * @param {string} sessionId - Checkout session ID
     */
    redirectToCheckout: async function(sessionId) {
        try {
            const stripe = await this.init();
            
            if (!stripe) {
                throw new Error('Stripe is not initialized');
            }
            
            const { error } = await stripe.redirectToCheckout({ sessionId });
            
            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            throw error;
        }
    },
    
    // Create a subscription
    createSubscription: async function(options) {
        try {
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating subscription:', error);
            return { error: error.message };
        }
    },
    
    /**
     * Format price for display
     * @param {number} amount - Amount in cents
     * @param {string} currency - Currency code
     * @returns {string} Formatted price
     */
    formatPrice: function(amount, currency = 'usd') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        });
        
        return formatter.format(amount / 100);
    }
};

// Export for browser environment
if (typeof window !== 'undefined') {
    window.StripeConfig = StripeConfig;
    window.StripeAPI = StripeAPI;
}

// Export for module environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StripeConfig, StripeAPI };
} 