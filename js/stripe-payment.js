/**
 * Stripe Payment Processing for Garden E-Commerce Platform
 * This file handles Stripe payment integration on the checkout page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the checkout page
    if (!document.getElementById('payment-form')) {
        return;
    }
    
    // DOM Elements
    const paymentForm = document.getElementById('payment-form');
    const paymentMethodContainer = document.getElementById('payment-method');
    const cardElementContainer = document.getElementById('card-element');
    const paymentErrorContainer = document.getElementById('payment-errors');
    const paymentProcessingContainer = document.getElementById('payment-processing');
    const submitButton = document.getElementById('submit-payment');
    
    // Get order total from the page
    const orderTotal = parseFloat(document.getElementById('order-total').dataset.total || '0');
    
    // Initialize Stripe with your publishable key
    const stripe = StripeAPI.init();
    if (!stripe) {
        showError('Failed to initialize Stripe. Please try again later.');
        return;
    }
    
    // Create Stripe elements
    const elements = StripeAPI.initElements(stripe);
    if (!elements) {
        showError('Failed to initialize Stripe Elements. Please refresh the page and try again.');
        return;
    }
    
    // Create and mount the card element
    const cardElement = StripeAPI.createCardElement(elements);
    if (cardElement && cardElementContainer) {
        cardElement.mount(cardElementContainer);
        
        // Listen for change events on the card element
        cardElement.on('change', function(event) {
            if (event.error) {
                showError(event.error.message);
            } else {
                clearError();
            }
        });
    }
    
    // Handle form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handleSubmit);
    }
    
    /**
     * Handle the payment form submission
     * @param {Event} event - The form submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        // Disable the submit button to prevent multiple submissions
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
        }
        
        // Show processing message
        if (paymentProcessingContainer) {
            paymentProcessingContainer.style.display = 'block';
        }
        
        // Clear any previous errors
        clearError();
        
        try {
            // Get billing details from the form
            const billingDetails = {
                name: document.getElementById('billing-name').value,
                email: document.getElementById('billing-email').value,
                address: {
                    line1: document.getElementById('billing-address').value,
                    city: document.getElementById('billing-city').value,
                    state: document.getElementById('billing-state').value,
                    postal_code: document.getElementById('billing-zip').value,
                    country: document.getElementById('billing-country').value
                }
            };
            
            // First, create a payment intent on the server
            const paymentIntentResult = await StripeAPI.createPaymentIntent(
                Math.round(orderTotal * 100), // Convert to cents
                StripeConfig.currency,
                {
                    order_id: document.getElementById('order-id').value
                }
            );
            
            if (paymentIntentResult.error) {
                throw new Error(paymentIntentResult.error);
            }
            
            // Confirm the card payment
            const { clientSecret } = paymentIntentResult;
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: billingDetails
                }
            });
            
            if (error) {
                throw error;
            }
            
            // Payment succeeded
            if (paymentIntent.status === 'succeeded') {
                // Store order information in sessionStorage
                sessionStorage.setItem('orderDetails', JSON.stringify({
                    id: document.getElementById('order-id').value,
                    total: orderTotal,
                    status: 'paid',
                    payment_id: paymentIntent.id,
                    customer: billingDetails.name,
                    email: billingDetails.email,
                    shipping_address: {
                        line1: document.getElementById('shipping-address').value,
                        city: document.getElementById('shipping-city').value,
                        state: document.getElementById('shipping-state').value,
                        postal_code: document.getElementById('shipping-zip').value,
                        country: document.getElementById('shipping-country').value
                    },
                    timestamp: new Date().toISOString(),
                    items: JSON.parse(sessionStorage.getItem('cartItems') || '[]')
                }));
                
                // Clear the cart
                sessionStorage.removeItem('cartItems');
                localStorage.removeItem('cartItems');
                
                // Redirect to confirmation page
                window.location.href = StripeConfig.redirects.success;
            } else {
                throw new Error('Payment processing failed. Please try again.');
            }
        } catch (error) {
            // Show error to customer
            showError(error.message);
            
            // Re-enable the submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Pay Now';
            }
            
            // Hide processing message
            if (paymentProcessingContainer) {
                paymentProcessingContainer.style.display = 'none';
            }
        }
    }
    
    // Payment Method Selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    if (paymentOptions.length > 0) {
        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Get payment method
                const paymentMethod = this.dataset.method;
                
                // Set payment method value
                const paymentMethodInput = document.getElementById('payment-method-input');
                if (paymentMethodInput) {
                    paymentMethodInput.value = paymentMethod;
                }
                
                // Show/hide card element based on payment method
                if (paymentMethod === 'card' && cardElementContainer) {
                    cardElementContainer.style.display = 'block';
                } else if (cardElementContainer) {
                    cardElementContainer.style.display = 'none';
                }
            });
        });
        
        // Activate default payment method (first one)
        paymentOptions[0].click();
    }
    
    /**
     * Show error message
     * @param {string} message - The error message to display
     */
    function showError(message) {
        if (paymentErrorContainer) {
            paymentErrorContainer.textContent = message;
            paymentErrorContainer.style.display = 'block';
        } else {
            console.error('Payment error:', message);
        }
    }
    
    /**
     * Clear error message
     */
    function clearError() {
        if (paymentErrorContainer) {
            paymentErrorContainer.textContent = '';
            paymentErrorContainer.style.display = 'none';
        }
    }
    
    /**
     * Format currency amount
     * @param {number} amount - The amount to format
     * @returns {string} - Formatted currency amount
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: StripeConfig.currency
        }).format(amount);
    }
    
    // Update order summary if needed
    updateOrderSummary();
    
    /**
     * Update the order summary
     */
    function updateOrderSummary() {
        const orderSummary = document.getElementById('order-summary');
        if (!orderSummary) return;
        
        // First try to get cart items from the checkout object
        let cartItems = [];
        if (window.checkout && window.checkout.cart && window.checkout.cart.cartItems) {
            // Use checkout's cart if available
            cartItems = window.checkout.cart.cartItems.map(item => {
                const product = window.checkout.cart.products[item.id];
                return {
                    id: item.id,
                    name: product ? product.name : item.id,
                    price: product ? product.price : 0,
                    quantity: item.quantity
                };
            });
        } else {
            // Get cart items from localStorage if not available in checkout
            try {
                // Try new cart format first
                const savedCart = localStorage.getItem('myGardenCart');
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
                        console.log('Found cart items in localStorage (myGardenCart)');
                        // Need to map products since they're not part of myGardenCart
                        cartItems = parsedCart.items;
                    }
                }
                
                // If still no items, try old format
                if (!cartItems.length) {
                    const oldCartItems = localStorage.getItem('cartItems');
                    if (oldCartItems) {
                        console.log('Found cart items in localStorage (cartItems)');
                        cartItems = JSON.parse(oldCartItems);
                    }
                }
                
                // If still no items, try sessionStorage as last resort
                if (!cartItems.length) {
                    const sessionCartItems = sessionStorage.getItem('cartItems');
                    if (sessionCartItems) {
                        console.log('Found cart items in sessionStorage');
                        cartItems = JSON.parse(sessionCartItems);
                    }
                }
            } catch (e) {
                console.error('Error loading cart data:', e);
            }
        }
        
        // If no items, redirect to cart
        if (!cartItems.length) {
            console.error('No cart items found, redirecting to cart');
            window.location.href = '/cart.html';
            return;
        }
        
        // Calculate totals
        let subtotal = 0;
        let taxRate = 0.07; // 7% tax rate
        let shippingRate = 9.99; // Standard shipping rate
        
        // Update order items list
        const orderItemsList = document.getElementById('order-items');
        if (orderItemsList) {
            orderItemsList.innerHTML = '';
            
            cartItems.forEach(item => {
                // Handle different cart item formats
                const price = typeof item.price === 'number' ? item.price : 
                              typeof item.price === 'string' && item.price.startsWith('$') ? 
                              parseFloat(item.price.substring(1)) : 0;
                
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;
                
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">x${item.quantity}</span>
                    </div>
                    <div class="item-price">${formatCurrency(itemTotal)}</div>
                `;
                
                orderItemsList.appendChild(itemElement);
            });
        }
        
        // Calculate tax and total
        const tax = subtotal * taxRate;
        const shipping = shippingRate;
        const total = subtotal + tax + shipping;
        
        // Update summary values
        document.getElementById('subtotal-value').textContent = formatCurrency(subtotal);
        document.getElementById('tax-value').textContent = formatCurrency(tax);
        document.getElementById('shipping-value').textContent = formatCurrency(shipping);
        document.getElementById('total-value').textContent = formatCurrency(total);
        
        // Update data attribute for total
        if (document.getElementById('order-total')) {
            document.getElementById('order-total').dataset.total = total.toString();
        }
    }
}); 