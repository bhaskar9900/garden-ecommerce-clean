/**
 * Shopping Cart Functionality for My Culture Garden Experience
 * Handles cart operations like adding, removing, updating quantities
 * and checkout process
 */

class ShoppingCart {
    constructor() {
        this.cartItems = [];
        this.cartElement = document.getElementById('cart-content');
        this.cartBadge = document.querySelector('.cart-badge');
        this.subtotal = 0;
        this.shipping = 0;
        this.tax = 0;
        this.total = 0;
        
        // Sample product data - in a real implementation, this would come from a database
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
        
        this.init();
    }
    
    init() {
        // Add debugging to see what's happening
        this.debug("Cart initialization started");
        
        // Load cart from localStorage
        this.loadCart();
        
        // Update cart UI
        this.updateCartUI();
        
        // Update cart badge
        this.updateCartBadge();
        
        // Listen for cart changes
        this.setupListeners();
        
        // Add debug button to force add item
        this.setupDebugHelpers();
    }
    
    debug(message, data) {
        console.log("[Cart Debug]", message, data || '');
        
        // Add to debug element if it exists
        const debugOutput = document.getElementById('debug-output');
        if (debugOutput) {
            const time = new Date().toISOString().substr(11, 8);
            const debugLine = document.createElement('div');
            debugLine.innerHTML = `<strong>${time}</strong>: ${message}`;
            
            if (data) {
                const pre = document.createElement('pre');
                pre.style.fontSize = '12px';
                pre.style.marginLeft = '20px';
                pre.style.background = '#eee';
                pre.style.padding = '5px';
                pre.textContent = typeof data === 'object' ? 
                    JSON.stringify(data, null, 2) : 
                    data.toString();
                debugLine.appendChild(pre);
            }
            
            debugOutput.appendChild(debugLine);
        }
    }
    
    setupDebugHelpers() {
        const debugOutput = document.getElementById('debug-output');
        if (debugOutput) {
            // Add debug buttons
            const debugControls = document.createElement('div');
            debugControls.style.marginTop = '10px';
            debugControls.style.marginBottom = '20px';
            
            // Button to clear localStorage
            const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear Cart Storage';
            clearButton.style.marginRight = '10px';
            clearButton.onclick = () => {
                localStorage.removeItem('myGardenCart');
                localStorage.removeItem('cartItems');
                this.debug('Cleared cart storage');
                this.cartItems = [];
                this.updateCartUI();
                this.updateCartBadge();
            };
            
            // Button to add test item
            const addButton = document.createElement('button');
            addButton.textContent = 'Add Test Monstera';
            addButton.style.marginRight = '10px';
            addButton.onclick = () => {
                this.addItem('indoor-monstera');
                this.debug('Added test Monstera to cart');
                this.updateCartUI();
            };
            
            // Button to show storage
            const showButton = document.createElement('button');
            showButton.textContent = 'Show Storage Data';
            showButton.onclick = () => {
                const cartData = localStorage.getItem('myGardenCart');
                const oldCartData = localStorage.getItem('cartItems');
                this.debug('myGardenCart storage:', cartData);
                this.debug('cartItems storage:', oldCartData);
            };
            
            debugControls.appendChild(clearButton);
            debugControls.appendChild(addButton);
            debugControls.appendChild(showButton);
            
            debugOutput.parentNode.insertBefore(debugControls, debugOutput);
        }
    }
    
    loadCart() {
        // Try both localStorage keys for backward compatibility
        const savedCart = localStorage.getItem('myGardenCart');
        const oldCartItems = localStorage.getItem('cartItems');
        
        this.debug('Loading cart from localStorage - myGardenCart:', savedCart);
        this.debug('Loading cart from localStorage - cartItems:', oldCartItems);
        
        // Clear existing cart
        this.cartItems = [];
        
        // If we have the new format, use it
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                if (cartData && cartData.items && Array.isArray(cartData.items)) {
                    // Filter out any invalid items
                    this.cartItems = cartData.items.filter(item => {
                        // Ensure it has an ID and quantity
                        if (!item || !item.id) {
                            this.debug('Invalid cart item:', item);
                            return false;
                        }
                        return true;
                    });
                    this.debug('Loaded cart items from myGardenCart:', this.cartItems);
                } else {
                    this.debug('Invalid cart data format:', cartData);
                }
            } catch (e) {
                this.debug('Error loading cart data from myGardenCart', e.message);
            }
        } 
        // If we only have old format, convert it
        else if (oldCartItems) {
            try {
                const oldItems = JSON.parse(oldCartItems);
                this.debug('Converting old cart format:', oldItems);
                
                if (Array.isArray(oldItems)) {
                    // Map old format to new format
                    oldItems.forEach(item => {
                        if (!item || !item.id) return;
                        
                        // Make sure we have an ID that matches our product catalog
                        let adjustedId = item.id;
                        
                        // Try to map random IDs to known product IDs based on product name
                        if (!this.products[adjustedId] && item.name) {
                            const nameLower = item.name.toLowerCase();
                            if (nameLower.includes('monstera')) {
                                adjustedId = 'indoor-monstera';
                            } else if (nameLower.includes('fiddle')) {
                                adjustedId = 'indoor-fiddle';
                            } else if (nameLower.includes('ceramic') || nameLower.includes('pot')) {
                                adjustedId = 'accessory-planter';
                            } else if (nameLower.includes('snake')) {
                                adjustedId = 'indoor-snake';
                            }
                        }
                        
                        // Add to cart items
                        this.cartItems.push({
                            id: adjustedId,
                            quantity: item.quantity || 1
                        });
                    });
                    
                    this.debug('Converted old cart items:', this.cartItems);
                    
                    // Save in the new format immediately
                    this.saveCart();
                }
            } catch (e) {
                this.debug('Error converting old cart data', e.message);
            }
        } else {
            this.debug('No cart data found in localStorage');
        }
    }
    
    saveCart() {
        this.debug("Saving cart with items:", this.cartItems);
        
        // Save in new format
        const cartData = {
            items: this.cartItems
        };
        localStorage.setItem('myGardenCart', JSON.stringify(cartData));
        
        // Also save in old format for compatibility with existing code
        const oldFormatItems = this.cartItems.map(item => {
            const product = this.products[item.id];
            return {
                id: item.id,
                name: product ? product.name : item.id,
                price: product ? `$${product.price.toFixed(2)}` : "$0.00",
                image: product ? product.image : "",
                quantity: item.quantity
            };
        });
        localStorage.setItem('cartItems', JSON.stringify(oldFormatItems));
        
        this.debug('Cart saved to localStorage');
    }
    
    updateCartBadge() {
        if (this.cartBadge) {
            const itemCount = this.getItemCount();
            this.cartBadge.textContent = itemCount;
            this.cartBadge.setAttribute('aria-label', `${itemCount} items in cart`);
            
            if (itemCount > 0) {
                this.cartBadge.classList.add('has-items');
            } else {
                this.cartBadge.classList.remove('has-items');
            }
            
            // Dispatch event for main script to update its badge too
            document.dispatchEvent(new CustomEvent('cart-updated', {
                detail: {
                    count: itemCount
                }
            }));
        }
    }
    
    getItemCount() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }
    
    updateCartUI() {
        if (!this.cartElement) return;
        
        // Clear loading message
        this.cartElement.innerHTML = '';
        
        if (this.cartItems.length === 0) {
            this.renderEmptyCart();
        } else {
            this.renderCartItems();
        }
    }
    
    renderEmptyCart() {
        this.cartElement.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h2 class="cart-empty-text">Your cart is empty</h2>
                <p>Looks like you haven't added any plants to your cart yet.</p>
                <a href="index.html#products" class="button button-primary">Explore Products</a>
            </div>
        `;
    }
    
    renderCartItems() {
        // Calculate cart summary values
        this.calculateCartTotals();
        
        this.debug('Rendering cart items:', this.cartItems);
        
        // Create HTML for cart items
        let cartHTML = `
            <div class="cart-items">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let itemsAdded = 0;
        
        // Add each item to the table
        this.cartItems.forEach(item => {
            this.debug('Processing cart item:', item);
            const product = this.products[item.id];
            if (!product) {
                this.debug('Product not found for ID:', item.id);
                this.debug('Available products:', Object.keys(this.products));
                return; // Skip if product not found
            }
            
            itemsAdded++;
            this.debug('Found product:', product);
            const itemTotal = (product.price * item.quantity).toFixed(2);
            
            cartHTML += `
                <tr data-product-id="${item.id}">
                    <td>
                        <div class="cart-product">
                            <img src="${product.image}" alt="${product.name}" class="cart-product-image">
                            <div>
                                <h3 class="cart-product-name">${product.name}</h3>
                                <p class="cart-product-details">${product.category}</p>
                            </div>
                        </div>
                    </td>
                    <td class="cart-price">$${product.price.toFixed(2)}</td>
                    <td>
                        <div class="cart-quantity">
                            <button class="cart-quantity-button decrease-quantity" aria-label="Decrease quantity">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" max="99" aria-label="Quantity">
                            <button class="cart-quantity-button increase-quantity" aria-label="Increase quantity">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td class="cart-price">$${itemTotal}</td>
                    <td>
                        <button class="cart-remove" aria-label="Remove item">Remove</button>
                    </td>
                </tr>
            `;
        });
        
        this.debug(`Added ${itemsAdded} items to cart table`);
        
        if (itemsAdded === 0) {
            this.debug('No items were added to cart table, showing empty cart');
            this.renderEmptyCart();
            return;
        }
        
        cartHTML += `
                    </tbody>
                </table>
            </div>
            
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span class="cart-summary-label">Subtotal</span>
                    <span class="cart-summary-value">$${this.subtotal.toFixed(2)}</span>
                </div>
                <div class="cart-summary-row">
                    <span class="cart-summary-label">Shipping</span>
                    <span class="cart-summary-value">$${this.shipping.toFixed(2)}</span>
                </div>
                <div class="cart-summary-row">
                    <span class="cart-summary-label">Tax</span>
                    <span class="cart-summary-value">$${this.tax.toFixed(2)}</span>
                </div>
                <div class="cart-summary-row">
                    <span class="cart-summary-total-label">Total</span>
                    <span class="cart-summary-total-value">$${this.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="cart-actions">
                <a href="index.html#products" class="continue-shopping">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
                <button class="checkout-button" id="checkout-button">
                    Proceed to Checkout <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        
        this.cartElement.innerHTML = cartHTML;
        
        // Add event listeners to the cart items
        this.addCartItemListeners();
    }
    
    calculateCartTotals() {
        // Calculate subtotal
        this.subtotal = this.cartItems.reduce((total, item) => {
            const product = this.products[item.id];
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
        
        // Calculate shipping (free over $75)
        this.shipping = this.subtotal > 75 ? 0 : 9.99;
        
        // Calculate tax (7.5%)
        this.tax = this.subtotal * 0.075;
        
        // Calculate total
        this.total = this.subtotal + this.shipping + this.tax;
    }
    
    addCartItemListeners() {
        // Quantity decrease buttons
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', e => {
                // Find the closest button in case the icon was clicked
                const clickedButton = e.target.closest('.decrease-quantity');
                if (!clickedButton) return;
                
                const row = clickedButton.closest('tr');
                if (!row) return;
                
                const productId = row.dataset.productId;
                const input = row.querySelector('.cart-quantity-input');
                let quantity = parseInt(input.value);
                
                if (quantity > 1) {
                    quantity--;
                    input.value = quantity;
                    this.updateItemQuantity(productId, quantity);
                }
            });
        });
        
        // Quantity increase buttons
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', e => {
                // Find the closest button in case the icon was clicked
                const clickedButton = e.target.closest('.increase-quantity');
                if (!clickedButton) return;
                
                const row = clickedButton.closest('tr');
                if (!row) return;
                
                const productId = row.dataset.productId;
                const input = row.querySelector('.cart-quantity-input');
                let quantity = parseInt(input.value);
                
                quantity++;
                input.value = quantity;
                this.updateItemQuantity(productId, quantity);
            });
        });
        
        // Quantity input changes
        document.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', e => {
                const row = e.target.closest('tr');
                if (!row) return;
                
                const productId = row.dataset.productId;
                let quantity = parseInt(e.target.value);
                
                // Ensure quantity is at least 1
                quantity = Math.max(1, quantity);
                e.target.value = quantity;
                
                this.updateItemQuantity(productId, quantity);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.cart-remove').forEach(button => {
            button.addEventListener('click', e => {
                const row = e.target.closest('tr');
                const productId = row.dataset.productId;
                this.removeItem(productId);
            });
        });
        
        // Checkout button
        const checkoutButton = document.getElementById('checkout-button');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }
    
    updateItemQuantity(productId, quantity) {
        const itemIndex = this.cartItems.findIndex(item => item.id === productId);
        if (itemIndex !== -1) {
            this.cartItems[itemIndex].quantity = quantity;
            this.saveCart();
            
            // Update the item's row instead of rebuilding the entire cart
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                const product = this.products[productId];
                if (product) {
                    const itemTotal = (product.price * quantity).toFixed(2);
                    row.querySelector('.cart-quantity-input').value = quantity;
                    row.querySelector('td:nth-child(4)').textContent = `$${itemTotal}`;
                    
                    // Update the cart totals
                    this.calculateCartTotals();
                    
                    // Update the summary section
                    const summarySection = document.querySelector('.cart-summary');
                    if (summarySection) {
                        const summaryValues = summarySection.querySelectorAll('.cart-summary-value');
                        if (summaryValues.length >= 3) {
                            summaryValues[0].textContent = `$${this.subtotal.toFixed(2)}`;
                            summaryValues[1].textContent = `$${this.shipping.toFixed(2)}`;
                            summaryValues[2].textContent = `$${this.tax.toFixed(2)}`;
                        }
                        
                        const totalValue = summarySection.querySelector('.cart-summary-total-value');
                        if (totalValue) {
                            totalValue.textContent = `$${this.total.toFixed(2)}`;
                        }
                    }
                }
            } else {
                // If the row can't be found, rebuild the entire UI
                this.updateCartUI();
            }
            
            this.updateCartBadge();
        }
    }
    
    removeItem(productId) {
        this.cartItems = this.cartItems.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.updateCartBadge();
    }
    
    // Helper method to normalize product IDs
    normalizeProductId(productId) {
        // If we have a direct match, use it
        if (this.products[productId]) {
            return productId;
        }
        
        // Try to find a match by name pattern
        const idLower = productId.toLowerCase();
        if (idLower.includes('monstera')) {
            return 'indoor-monstera';
        } else if (idLower.includes('fiddle')) {
            return 'indoor-fiddle';
        } else if (idLower.includes('snake')) {
            return 'indoor-snake';
        } else if (idLower.includes('ceramic') || idLower.includes('pot') || idLower.includes('planter')) {
            return 'accessory-planter';
        } else if (idLower.includes('soil')) {
            return 'accessory-soil';
        } else if (idLower.includes('lavender')) {
            return 'outdoor-lavender';
        } else if (idLower.includes('rose')) {
            return 'outdoor-rose';
        }
        
        // If all else fails, try to find a category match
        if (idLower.includes('indoor')) {
            // Default to monstera for indoor plants
            return 'indoor-monstera';
        } else if (idLower.includes('outdoor')) {
            // Default to lavender for outdoor plants
            return 'outdoor-lavender';
        } else if (idLower.includes('accessory')) {
            // Default to planter for accessories
            return 'accessory-planter';
        }
        
        // If still no match, return the original ID
        return productId;
    }
    
    addItem(productId, quantity = 1) {
        this.debug('Adding item to cart:', { productId, quantity });
        
        // Normalize the product ID
        const normalizedId = this.normalizeProductId(productId);
        if (normalizedId !== productId) {
            this.debug(`Normalized product ID from ${productId} to ${normalizedId}`);
            productId = normalizedId;
        }
        
        const itemIndex = this.cartItems.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            // Update quantity if item already exists
            this.cartItems[itemIndex].quantity += quantity;
            this.debug('Updated quantity for existing item:', this.cartItems[itemIndex]);
        } else {
            // Add new item
            this.cartItems.push({
                id: productId,
                quantity: quantity
            });
            this.debug('Added new item to cart:', { id: productId, quantity });
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.updateCartUI();
        
        // Show success notification
        const product = this.products[productId];
        if (product) {
            this.debug('Product found for notification:', product);
            this.showNotification(`${product.name} added to your cart`, 'success');
        } else {
            this.debug('ERROR: Product not found for ID:', productId);
            this.debug('Available products:', Object.keys(this.products));
        }
    }
    
    proceedToCheckout() {
        // Redirect to the checkout page
        window.location.href = 'checkout.html';
    }
    
    showNotification(message, type = 'info') {
        // Check if GardenApp has a notification system we can use
        if (window.GardenApp && typeof window.GardenApp.showNotification === 'function') {
            window.GardenApp.showNotification(message, type);
        } else {
            // Simple alert fallback
            alert(message);
        }
    }
    
    setupListeners() {
        // Listen for add-to-cart events from other pages
        document.addEventListener('add-to-cart', event => {
            if (event.detail && event.detail.productId) {
                this.addItem(event.detail.productId, event.detail.quantity || 1);
            }
        });
        
        // Listen for localStorage changes (for cross-page communication)
        window.addEventListener('storage', event => {
            if (event.key === 'myGardenCart' || event.key === 'cartItems') {
                this.debug('Storage event detected, reloading cart', event.key);
                this.loadCart();
                this.updateCartUI();
                this.updateCartBadge();
            }
        });
        
        // Update "view cart" buttons to link to cart page
        document.querySelectorAll('[data-action="view-cart"]').forEach(button => {
            // Convert button to link if it's not inside the cart page
            if (!window.location.pathname.includes('cart.html')) {
                button.addEventListener('click', (e) => {
                    window.location.href = 'cart.html';
                });
            }
        });
    }
    
    startStoragePolling() {
        this.debug("Starting storage polling");
        
        // Store the current cart data hash
        this.lastStorageHash = JSON.stringify(this.cartItems);
        
        // Check for changes every 2 seconds
        this.storagePollingInterval = setInterval(() => {
            try {
                const currentCartData = localStorage.getItem('myGardenCart');
                if (currentCartData) {
                    const parsedData = JSON.parse(currentCartData);
                    const currentHash = JSON.stringify(parsedData.items || []);
                    
                    // If the hash is different, reload the cart
                    if (this.lastStorageHash !== currentHash) {
                        this.debug("Storage poll detected changes", {
                            old: JSON.parse(this.lastStorageHash),
                            new: parsedData.items
                        });
                        
                        this.loadCart();
                        this.updateCartUI();
                        this.updateCartBadge();
                        
                        // Update the hash
                        this.lastStorageHash = currentHash;
                    }
                }
            } catch (e) {
                this.debug("Error in storage polling", e.message);
            }
        }, 2000);
        
        // Clean up the interval when the page is unloaded
        window.addEventListener('beforeunload', () => {
            if (this.storagePollingInterval) {
                clearInterval(this.storagePollingInterval);
            }
        });
    }
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = new ShoppingCart();
    
    // Force a re-render after a small delay to ensure DOM is fully loaded
    setTimeout(() => {
        if (window.shoppingCart) {
            window.shoppingCart.debug("Running delayed updateCartUI");
            window.shoppingCart.updateCartUI();
            
            // Start polling localStorage for changes
            window.shoppingCart.startStoragePolling();
        }
    }, 500);
}); 