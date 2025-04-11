/**
 * Razorpay Configuration and API Utilities
 * Handles Razorpay payment gateway integration for Garden E-Commerce Platform
 */

const RazorpayConfig = {
    // Razorpay API Keys - Replace with your actual keys
    keyId: 'YOUR_RAZORPAY_KEY_ID', // Your Razorpay key
    
    // Endpoint URLs
    endpoints: {
        createOrder: '/api/razorpay/create-order',
        verifyPayment: '/api/razorpay/verify-payment'
    },
    
    // Redirect URLs
    redirects: {
        success: '/confirmation.html',
        cancel: '/checkout.html'
    }
};

const RazorpayAPI = {
    // Initialize Razorpay
    init: function() {
        try {
            if (typeof window === 'undefined' || !window.Razorpay) {
                console.error('Razorpay SDK not found or not loaded. Make sure to include the Razorpay script.');
                alert('Payment gateway not available. Please try again later or contact support.');
                return null;
            }
            
            console.log('Initializing Razorpay with key ID:', RazorpayConfig.keyId);
            return new window.Razorpay({
                key: RazorpayConfig.keyId,
                image: '/images/logo-icon.png',
                timeout: 120, // Timeout in seconds
                retry: {
                    enabled: true,
                    max_count: 3
                }
            });
        } catch (error) {
            console.error('Failed to initialize Razorpay:', error);
            alert('Failed to initialize payment gateway: ' + error.message);
            return null;
        }
    },
    
    // Create an order for UPI payment
    createUPIOrder: async function(orderData) {
        try {
            const response = await fetch(RazorpayConfig.endpoints.createOrder, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create Razorpay order');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Create and show a UPI payment
    showUPIPayment: function(razorpay, options) {
        try {
            // Create payment options
            const paymentOptions = {
                ...options,
                handler: function(response) {
                    // Handle successful payment
                    if (options.onSuccess) {
                        options.onSuccess(response);
                    }
                },
                modal: {
                    ondismiss: function() {
                        if (options.onDismiss) {
                            options.onDismiss();
                        }
                    }
                },
                prefill: options.prefill || {},
                theme: options.theme || { color: '#1a4d3c' } // Garden theme color
            };
            
            // Open Razorpay payment form
            razorpay.open(paymentOptions);
            return true;
        } catch (error) {
            console.error('Error showing UPI payment:', error);
            if (options.onError) {
                options.onError(error);
            }
            return false;
        }
    },
    
    // Verify a payment
    verifyPayment: async function(paymentData) {
        try {
            const response = await fetch(RazorpayConfig.endpoints.verifyPayment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to verify payment');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error verifying payment:', error);
            return { success: false, error: error.message };
        }
    }
}; 