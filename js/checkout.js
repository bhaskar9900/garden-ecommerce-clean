/**
 * Checkout functionality for My Culture Garden
 * Handles checkout process including:
 * - Order summary from cart
 * - Form validation
 * - Shipping method selection
 * - Payment method selection
 * - Order placement
 */

class Checkout {
    constructor() {
        this.cart = window.shoppingCart;
        this.cartItems = [];
        this.products = {};
        this.subtotal = 0;
        this.shipping = 9.99; // Default shipping cost
        this.tax = 0;
        this.total = 0;
        this.shippingMethod = 'standard';
        this.paymentMethod = 'card';
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log('Initializing checkout...');
        
        // If window.shoppingCart isn't available yet, load cart data directly from localStorage
        if (!this.cart || !this.cart.cartItems) {
            console.log('Shopping cart not available, loading from localStorage directly');
            this.loadCartFromLocalStorage();
        }
        
        // Load cart items into the summary
        this.loadCartItems();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Calculate totals
        this.calculateTotals();
        
        // Update UI
        this.updateOrderSummary();
    }
    
    loadCartFromLocalStorage() {
        // Try both localStorage keys for backward compatibility
        const savedCart = localStorage.getItem('myGardenCart');
        const oldCartItems = localStorage.getItem('cartItems');
        
        console.log('Loading cart from localStorage - myGardenCart:', savedCart);
        
        // Load cart items
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                if (cartData && cartData.items && Array.isArray(cartData.items)) {
                    this.cartItems = cartData.items;
                    console.log('Loaded cart items:', this.cartItems);
                }
            } catch (e) {
                console.error('Error loading cart data:', e);
            }
        } else if (oldCartItems) {
            try {
                this.cartItems = JSON.parse(oldCartItems);
                console.log('Loaded cart items from old format:', this.cartItems);
            } catch (e) {
                console.error('Error loading old cart data:', e);
            }
        }
        
        // Load product data (fallback to basic product data)
        this.products = {
            'indoor-monstera': {
                id: 'indoor-monstera',
                name: 'Monstera Deliciosa',
                category: 'Indoor Plant',
                price: 49.99,
                image: 'images/product1.jpg'
            },
            'indoor-peacelily': {
                id: 'indoor-peacelily',
                name: 'Peace Lily',
                category: 'Indoor Plant',
                price: 39.99,
                image: 'images/product2.jpg'
            },
            'indoor-fiddle': {
                id: 'indoor-fiddle',
                name: 'Fiddle Leaf Fig',
                category: 'Indoor Plant',
                price: 59.99,
                image: 'images/product2.jpg'
            },
            'outdoor-lavender': {
                id: 'outdoor-lavender',
                name: 'Lavender Plant',
                category: 'Outdoor Plant',
                price: 29.99,
                image: 'images/product4.jpg'
            },
            'outdoor-rose': {
                id: 'outdoor-rose',
                name: 'Rose Bush',
                category: 'Outdoor Plant',
                price: 34.99,
                image: 'images/product1.jpg'
            },
            'accessory-planter': {
                id: 'accessory-planter',
                name: 'Ceramic Planter',
                category: 'Accessory',
                price: 24.99,
                image: 'images/product3.jpg'
            },
            'accessory-soil': {
                id: 'accessory-soil',
                name: 'Premium Potting Soil',
                category: 'Accessory',
                price: 19.99,
                image: 'images/product3.jpg'
            },
            'indoor-snake': {
                id: 'indoor-snake',
                name: 'Snake Plant',
                category: 'Indoor Plant',
                price: 35.99,
                image: 'images/product4.jpg'
            }
        };
    }
    
    loadCartItems() {
        const summaryItemsContainer = document.getElementById('summary-items');
        if (!summaryItemsContainer) return;
        
        // Clear container
        summaryItemsContainer.innerHTML = '';
        
        // Get cart items either from window.shoppingCart or from our local copy
        const cartItems = this.cart && this.cart.cartItems ? this.cart.cartItems : this.cartItems;
        const products = this.cart && this.cart.products ? this.cart.products : this.products;
        
        // Make sure we have cart items
        if (!cartItems || cartItems.length === 0) {
            console.error('Cart not available or empty');
            summaryItemsContainer.innerHTML = '<p>Your cart is empty. <a href="index.html#products">Continue shopping</a>.</p>';
            return;
        }
        
        // Loop through cart items
        cartItems.forEach(item => {
            const product = products[item.id];
            if (!product) return;
            
            const itemTotal = (product.price * item.quantity).toFixed(2);
            
            const itemElement = document.createElement('div');
            itemElement.className = 'summary-item';
            itemElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="summary-item-image">
                <div class="summary-item-details">
                    <div class="summary-item-title">${product.name}</div>
                    <div class="summary-item-meta">${product.category} • Qty: ${item.quantity}</div>
                </div>
                <div class="summary-item-price">$${itemTotal}</div>
            `;
            
            summaryItemsContainer.appendChild(itemElement);
        });
    }
    
    calculateTotals() {
        // Get cart items either from window.shoppingCart or from our local copy
        const cartItems = this.cart && this.cart.cartItems ? this.cart.cartItems : this.cartItems;
        const products = this.cart && this.cart.products ? this.cart.products : this.products;
        
        // Get subtotal from cart
        if (this.cart && this.cart.subtotal) {
            this.subtotal = this.cart.subtotal;
        } else {
            // Calculate ourselves if not available
            this.subtotal = 0;
            if (cartItems) {
                cartItems.forEach(item => {
                    const product = products[item.id];
                    if (product) {
                        this.subtotal += product.price * item.quantity;
                    }
                });
            }
        }
        
        // Set shipping based on method
        if (this.shippingMethod === 'standard') {
            this.shipping = this.subtotal > 75 ? 0 : 9.99;
        } else if (this.shippingMethod === 'express') {
            this.shipping = 19.99;
        } else if (this.shippingMethod === 'free') {
            this.shipping = 0;
        }
        
        // Add COD convenience fee if applicable
        if (this.paymentMethod === 'cod') {
            this.shipping += 2.00;
        }
        
        // Calculate tax (7.5%)
        this.tax = this.subtotal * 0.075;
        
        // Calculate total
        this.total = this.subtotal + this.shipping + this.tax;
    }
    
    updateOrderSummary() {
        // Update summary values
        const subtotalEl = document.getElementById('summary-subtotal');
        const shippingEl = document.getElementById('summary-shipping');
        const taxEl = document.getElementById('summary-tax');
        const totalEl = document.getElementById('summary-total');
        
        if (subtotalEl) subtotalEl.textContent = `$${this.subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `$${this.shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${this.tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${this.total.toFixed(2)}`;
        
        // Update shipping options based on subtotal
        const freeShippingOption = document.querySelector('.shipping-option input[value="free"]');
        if (freeShippingOption) {
            const shippingOption = freeShippingOption.closest('.shipping-option');
            if (this.subtotal >= 75) {
                freeShippingOption.disabled = false;
                shippingOption.classList.remove('disabled');
                
                // Auto-select free shipping if eligible
                if (this.shippingMethod !== 'express') {
                    freeShippingOption.checked = true;
                    this.shippingMethod = 'free';
                    this.updateSelectedShippingOption();
                }
            } else {
                freeShippingOption.disabled = true;
                shippingOption.classList.add('disabled');
                
                // Select standard if free is no longer eligible
                if (this.shippingMethod === 'free') {
                    const standardOption = document.querySelector('.shipping-option input[value="standard"]');
                    if (standardOption) {
                        standardOption.checked = true;
                        this.shippingMethod = 'standard';
                        this.updateSelectedShippingOption();
                    }
                }
            }
        }
    }
    
    setupEventListeners() {
        // Shipping method selection
        const shippingOptions = document.querySelectorAll('.shipping-option input');
        shippingOptions.forEach(option => {
            option.addEventListener('change', e => {
                this.shippingMethod = e.target.value;
                this.updateSelectedShippingOption();
                this.calculateTotals();
                this.updateOrderSummary();
            });
        });
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', e => {
                // Update selected class
                paymentMethods.forEach(m => m.classList.remove('selected'));
                method.classList.add('selected');
                
                // Store selected method
                this.paymentMethod = method.dataset.method;
                
                // Show/hide appropriate payment form
                this.togglePaymentForm();
            });
        });
        
        // Form validation
        const shippingForm = document.getElementById('shipping-form');
        if (shippingForm) {
            const inputs = shippingForm.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });
            });
        }
        
        // Place order button
        const placeOrderBtn = document.getElementById('place-order-button');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }
    }
    
    updateSelectedShippingOption() {
        // Update visual selection
        const options = document.querySelectorAll('.shipping-option');
        options.forEach(option => {
            const input = option.querySelector('input');
            if (input && input.value === this.shippingMethod && !input.disabled) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    togglePaymentForm() {
        const cardInputs = document.querySelector('.card-inputs');
        
        // Remove any existing payment notices first
        const existingNotices = document.querySelectorAll('.payment-notice');
        existingNotices.forEach(notice => notice.remove());
        
        // Hide all payment-specific forms first
        if (cardInputs) cardInputs.style.display = 'none';
        
        // Show appropriate form based on selected payment method
        if (this.paymentMethod === 'card') {
            if (cardInputs) cardInputs.style.display = 'block';
        } else if (this.paymentMethod === 'cod') {
            // If there's a card inputs form, add a COD notice after it
            if (cardInputs) {
                const codNotice = document.createElement('div');
                codNotice.id = 'cod-notice';
                codNotice.className = 'payment-notice';
                codNotice.innerHTML = `
                    <p><i class="fas fa-info-circle"></i> Pay in cash at the time of delivery. 
                    A small convenience fee of $2.00 will be added to your total.</p>
                `;
                cardInputs.parentNode.insertBefore(codNotice, cardInputs.nextSibling);
            }
        } else if (['phonepay', 'googlepay', 'paytm'].includes(this.paymentMethod)) {
            // For UPI payment methods, show integration notice
            if (cardInputs) {
                const digitalPayment = document.createElement('div');
                digitalPayment.id = 'digital-payment-option';
                digitalPayment.className = 'payment-notice';
                
                let paymentMethodName = 'digital payment';
                let logoSrc = '';
                let logoAlt = '';
                let logoWidth = '100';
                let logoHeight = '40';
                
                if (this.paymentMethod === 'phonepay') {
                    paymentMethodName = 'PhonePe';
                    logoSrc = 'images/payment/phonepe-logo.png';
                    logoAlt = 'PhonePe';
                    logoWidth = '80';
                    logoHeight = '80';
                } else if (this.paymentMethod === 'googlepay') {
                    paymentMethodName = 'Google Pay';
                    logoSrc = 'images/payment/googlepay-logo.png';
                    logoAlt = 'Google Pay';
                    logoWidth = '120';
                    logoHeight = '48';
                } else if (this.paymentMethod === 'paytm') {
                    paymentMethodName = 'PayTm';
                    logoSrc = 'images/payment/paytm-logo.png';
                    logoAlt = 'PayTm';
                    logoWidth = '100';
                    logoHeight = '80';
                }
                
                digitalPayment.innerHTML = `
                    <p><i class="fas fa-info-circle"></i> You'll be redirected to complete your payment 
                    via ${paymentMethodName} using Razorpay secure checkout.</p>
                    <div class="payment-logo">
                        <img src="${logoSrc}" alt="${logoAlt}" width="${logoWidth}" height="${logoHeight}">
                    </div>
                    <div class="razorpay-notice">
                        <p><i class="fas fa-shield-alt"></i> Secured by Razorpay</p>
                    </div>
                `;
                
                cardInputs.parentNode.insertBefore(digitalPayment, cardInputs.nextSibling);
            }
        }
        
        // Update order total if switching from/to COD (which has a fee)
        this.calculateTotals();
        this.updateOrderSummary();
    }
    
    validateInput(input) {
        if (!input.value.trim()) {
            input.classList.add('invalid');
            return false;
        } else {
            input.classList.remove('invalid');
            return true;
        }
    }
    
    validateForms() {
        let isValid = true;
        
        // Validate shipping form
        const shippingForm = document.getElementById('shipping-form');
        if (shippingForm) {
            const inputs = shippingForm.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });
        }
        
        // Validate payment form if credit card is selected
        if (this.paymentMethod === 'card') {
            const paymentForm = document.getElementById('payment-form');
            if (paymentForm) {
                const inputs = paymentForm.querySelectorAll('input[required]');
                inputs.forEach(input => {
                    if (!this.validateInput(input)) {
                        isValid = false;
                    }
                });
            }
        }
        
        return isValid;
    }
    
    placeOrder() {
        // Validate all forms
        if (!this.validateForms()) {
            this.showNotification('Please complete all required fields', 'error');
            return;
        }
        
        // Get cart items either from window.shoppingCart or from our local copy
        const cartItems = this.cart && this.cart.cartItems ? this.cart.cartItems : this.cartItems;
        const products = this.cart && this.cart.products ? this.cart.products : this.products;
        
        // Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Simulate order processing
        const placeOrderBtn = document.getElementById('place-order-button');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Processing...';
        }
        
        // Collect order information
        const orderData = {
            items: cartItems,
            products: products,
            subtotal: this.subtotal,
            shipping: this.shipping,
            tax: this.tax,
            total: this.total,
            shippingMethod: this.shippingMethod,
            paymentMethod: this.paymentMethod,
            shippingInfo: this.getShippingInfo()
        };
        
        console.log('Placing order:', orderData);
        
        // Generate order ID
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        
        // Process based on payment method
        if (['phonepay', 'googlepay', 'paytm'].includes(this.paymentMethod)) {
            // Handle UPI payments with Razorpay
            this.processRazorpayPayment(orderData, orderId);
        } else {
            // Handle other payment methods (original flow)
            // Simulate order submission based on payment method
            setTimeout(() => {
                // Success scenario
                // Clear cart
                localStorage.removeItem('myGardenCart');
                localStorage.removeItem('cartItems');
                
                // Add order ID and date to the order data
                orderData.orderId = orderId;
                orderData.date = new Date().toISOString();
                
                // Store the complete order data in sessionStorage (will be available for 30 minutes)
                sessionStorage.setItem('orderData', JSON.stringify(orderData));
                
                // Save basic order reference in localStorage for future reference
                localStorage.setItem('lastOrder', JSON.stringify({
                    orderId: orderId,
                    date: new Date().toISOString(),
                    total: this.total,
                    paymentMethod: this.paymentMethod
                }));
                
                // Create appropriate success message based on payment method
                let successMessage = '';
                let redirectDelay = 2000;
                
                if (this.paymentMethod === 'cod') {
                    successMessage = 'Order placed successfully! You will pay on delivery.';
                } else if (this.paymentMethod === 'card') {
                    successMessage = 'Payment successful! Your order has been placed.';
                } 
                
                // Show success notification
                this.showNotification(successMessage, 'success');
                
                // Redirect to confirmation page
                setTimeout(() => {
                    window.location.href = 'confirmation.html';
                }, redirectDelay);
            }, 1500);
        }
    }
    
    // Process payment through Razorpay
    processRazorpayPayment(orderData, orderId) {
        // Initialize Razorpay
        console.log('Initializing Razorpay with key:', RazorpayConfig.keyId);
        const razorpay = RazorpayAPI.init();
        if (!razorpay) {
            this.showNotification('Failed to initialize payment gateway', 'error');
            const placeOrderBtn = document.getElementById('place-order-button');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
            return;
        }
        
        // Get customer information
        const shippingInfo = this.getShippingInfo();
        const customerEmail = document.getElementById('email').value;
        const customerPhone = document.getElementById('phone').value || '';
        
        console.log('Creating order for amount:', this.total);
        
        // Create a copy of order data for server
        const serverOrderData = {
            amount: this.total,
            currency: 'INR',
            receipt: orderId,
            notes: {
                order_id: orderId,
                customer_email: customerEmail,
                payment_method: this.paymentMethod
            }
        };
        
        console.log('Sending order creation request:', serverOrderData);
        
        // Create Razorpay order
        fetch('http://localhost:3001/api/razorpay/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serverOrderData)
        })
        .then(response => {
            console.log('Response received from server:', response);
            return response.json();
        })
        .then(data => {
            console.log('Order creation response:', data);
            
            if (!data.success || !data.order || !data.order.id) {
                throw new Error('Failed to create payment order: ' + (data.error || 'Unknown error'));
            }
            
            // Get UPI method name for display
            let upiMethod = '';
            if (this.paymentMethod === 'phonepay') upiMethod = 'PhonePe';
            else if (this.paymentMethod === 'googlepay') upiMethod = 'Google Pay';
            else if (this.paymentMethod === 'paytm') upiMethod = 'Paytm';
            
            this.showNotification(`Initiating ${upiMethod} payment...`, 'info');
            
            // Set up payment options
            const options = {
                key: RazorpayConfig.keyId,
                amount: data.order.amount, // use amount from order response
                currency: data.order.currency,
                name: 'My Culture Garden',
                description: `Order #${orderId}`,
                order_id: data.order.id,
                prefill: {
                    name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                    email: customerEmail,
                    contact: customerPhone
                },
                notes: {
                    orderId: orderId,
                    shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`,
                    shipping_method: this.shippingMethod
                },
                theme: {
                    color: '#1a4d3c' // Garden theme color
                },
                handler: (response) => {
                    console.log('Payment successful', response);
                    this.verifyRazorpayPayment(response, orderData, orderId);
                },
                modal: {
                    ondismiss: () => {
                        console.log('Checkout form closed');
                        const placeOrderBtn = document.getElementById('place-order-button');
                        if (placeOrderBtn) {
                            placeOrderBtn.disabled = false;
                            placeOrderBtn.textContent = 'Place Order';
                        }
                    }
                }
            };
            
            console.log('Opening Razorpay with options:', options);
            
            // Open Razorpay checkout
            razorpay.open(options);
            
            // Reset the place order button
            const placeOrderBtn = document.getElementById('place-order-button');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            this.showNotification('Failed to initialize payment: ' + error.message, 'error');
            
            // Reset the place order button
            const placeOrderBtn = document.getElementById('place-order-button');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Order';
            }
        });
    }
    
    // Verify Razorpay payment
    verifyRazorpayPayment(paymentResponse, orderData, orderId) {
        // Send verification request to server
        fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentResponse)
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error('Payment verification failed');
            }
            
            // Clear cart
            localStorage.removeItem('myGardenCart');
            localStorage.removeItem('cartItems');
            
            // Add order ID and date to the order data
            orderData.orderId = orderId;
            orderData.date = new Date().toISOString();
            orderData.paymentId = paymentResponse.razorpay_payment_id;
            
            // Store the complete order data in sessionStorage
            sessionStorage.setItem('orderData', JSON.stringify(orderData));
            
            // Save basic order reference in localStorage
            localStorage.setItem('lastOrder', JSON.stringify({
                orderId: orderId,
                date: new Date().toISOString(),
                total: this.total,
                paymentMethod: this.paymentMethod,
                paymentId: paymentResponse.razorpay_payment_id
            }));
            
            // Show success notification
            this.showNotification('Payment successful! Your order has been placed.', 'success');
            
            // Redirect to confirmation page
            setTimeout(() => {
                window.location.href = 'confirmation.html';
            }, 2000);
        })
        .catch(error => {
            console.error('Payment verification error:', error);
            this.showNotification('Payment verification failed. Please contact support.', 'error');
        });
    }
    
    getShippingInfo() {
        const shippingForm = document.getElementById('shipping-form');
        if (!shippingForm) return {};
        
        // Get all form fields
        const formData = new FormData(shippingForm);
        const shippingInfo = {};
        
        // Convert to object
        for (const [key, value] of formData.entries()) {
            shippingInfo[key] = value;
        }
        
        return shippingInfo;
    }
    
    showNotification(message, type = 'info') {
        // Use GardenApp notification system if available
        if (window.GardenApp && typeof window.GardenApp.showNotification === 'function') {
            window.GardenApp.showNotification(message, type);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if shopping cart exists or needs time to initialize
    let initAttempts = 0;
    const maxAttempts = 5;
    const checkCartAndInit = () => {
        if (window.shoppingCart) {
            console.log('Shopping cart found, initializing checkout');
            window.checkout = new Checkout();
        } else {
            initAttempts++;
            if (initAttempts < maxAttempts) {
                console.log(`Shopping cart not found, attempt ${initAttempts}/${maxAttempts}. Trying again in 500ms...`);
                setTimeout(checkCartAndInit, 500);
            } else {
                console.log('Shopping cart not found after max attempts, initializing checkout with fallback');
                window.checkout = new Checkout();
            }
        }
    };
    
    // Start checking after a short delay
    setTimeout(checkCartAndInit, 500);
}); 