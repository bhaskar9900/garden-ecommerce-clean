// Confirmation Page Script
document.addEventListener('DOMContentLoaded', function() {
    // Get order details from URL parameters and sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const orderTotal = urlParams.get('total');
    const paymentMethod = urlParams.get('method');
    
    // Try to load full order data from sessionStorage
    let orderData = null;
    try {
        const storedOrderData = sessionStorage.getItem('orderData');
        if (storedOrderData) {
            orderData = JSON.parse(storedOrderData);
        }
    } catch (error) {
        console.error('Error loading order data from sessionStorage:', error);
    }
    
    // Display order information
    if (orderId) {
        document.getElementById('order-number').textContent = orderId;
        
        // Set order date to current date if not available from storage
        const orderDate = orderData?.date ? new Date(orderData.date).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        }) : new Date().toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        document.getElementById('order-date').textContent = orderDate;
        
        // Set payment method
        const paymentMethodDisplay = formatPaymentMethod(paymentMethod);
        document.getElementById('payment-method').textContent = paymentMethodDisplay;
        
        // Set shipping method
        document.getElementById('shipping-method').textContent = formatShippingMethod(orderData?.shippingMethod);
        
        // Set order totals
        if (orderData) {
            document.getElementById('order-subtotal').textContent = formatCurrency(orderData.subtotal);
            document.getElementById('order-shipping').textContent = formatCurrency(orderData.shipping);
            document.getElementById('order-tax').textContent = formatCurrency(orderData.tax);
            document.getElementById('order-total').textContent = formatCurrency(orderData.total);
            
            // Populate order items
            populateOrderItems(orderData.items, orderData.products);
            
            // Populate shipping address
            populateShippingAddress(orderData.shippingInfo);
        } else {
            // If detailed order data is not available, use URL params for minimal display
            document.getElementById('order-subtotal').textContent = 'N/A';
            document.getElementById('order-shipping').textContent = 'N/A';
            document.getElementById('order-tax').textContent = 'N/A';
            document.getElementById('order-total').textContent = formatCurrency(parseFloat(orderTotal) || 0);
            document.getElementById('order-items').innerHTML = '<p>Order details are no longer available.</p>';
            document.getElementById('shipping-address-details').innerHTML = '<p>Address information is no longer available.</p>';
        }
    } else {
        // No order ID found, show error message
        document.querySelector('.confirmation-container').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Order Information Not Found</h2>
                <p>We couldn't locate your order details. Please check your email for order confirmation or contact customer support.</p>
                <a href="index.html" class="btn">Return to Home</a>
            </div>
        `;
    }
    
    // Print confirmation handler
    const printBtn = document.getElementById('print-confirmation');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Continue shopping handler
    const continueBtn = document.getElementById('continue-shopping');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            window.location.href = 'index.html#products';
        });
    }
    
    // Initialize particles.js if available
    if (typeof particlesJS !== 'undefined') {
        initParticles();
    }
});

// Format payment method for display
function formatPaymentMethod(method) {
    if (!method) return 'Not specified';
    
    const methodMap = {
        'card': 'Credit/Debit Card',
        'phonepay': 'PhonePe',
        'googlepay': 'Google Pay',
        'paytm': 'Paytm',
        'cod': 'Cash on Delivery'
    };
    
    return methodMap[method] || method;
}

// Format shipping method for display
function formatShippingMethod(method) {
    if (!method) return 'Standard Shipping';
    
    const methodMap = {
        'standard': 'Standard Shipping (3-5 business days)',
        'express': 'Express Shipping (1-2 business days)',
        'free': 'Free Shipping (3-5 business days)'
    };
    
    return methodMap[method] || 'Standard Shipping';
}

// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

// Populate order items
function populateOrderItems(items, products) {
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        orderItemsContainer.innerHTML = '<p>No items to display.</p>';
        return;
    }
    
    items.forEach(item => {
        const product = products[item.id];
        if (!product) return;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'order-item';
        
        itemEl.innerHTML = `
            <div class="order-item-image">
                <img src="${product.image}" alt="${product.name}" width="60" height="60">
            </div>
            <div class="order-item-details">
                <div class="order-item-name">${product.name}</div>
                <div class="order-item-meta">${product.category} • Qty: ${item.quantity}</div>
            </div>
            <div class="order-item-price">${formatCurrency(product.price * item.quantity)}</div>
        `;
        
        orderItemsContainer.appendChild(itemEl);
    });
}

// Populate shipping address
function populateShippingAddress(shippingInfo) {
    const addressContainer = document.getElementById('shipping-address-details');
    
    if (!shippingInfo) {
        addressContainer.innerHTML = '<p>No address information available</p>';
        return;
    }
    
    addressContainer.innerHTML = `
        <p>${shippingInfo['first-name'] || ''} ${shippingInfo['last-name'] || ''}</p>
        <p>${shippingInfo.address || ''}</p>
        <p>${shippingInfo.city || ''}, ${shippingInfo.state || ''} ${shippingInfo.zip || ''}</p>
        <p>${shippingInfo.country || ''}</p>
        <p>${shippingInfo.email || ''}</p>
        <p>${shippingInfo.phone || ''}</p>
    `;
}

// Initialize particles.js background
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: {
                type: 'circle',
                stroke: { width: 0, color: '#000000' }
            },
            opacity: {
                value: 0.1,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.1,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: true, mode: 'push' },
                resize: true
            },
            modes: {
                grab: { distance: 140, line_linked: { opacity: 1 } },
                push: { particles_nb: 4 }
            }
        },
        retina_detect: true
    });
}