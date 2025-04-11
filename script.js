// Global namespace
const GardenApp = {
    // Configuration
    config: {
        selectors: {
            header: '.site-header',
            nav: '.nav-main',
            mobileMenu: '#mobile-menu',
            searchForm: '.search-form',
            navToggle: '.nav-toggle',
            navLinks: '.nav-link',
            animatedElements: '.animate-fade-in',
            productCards: '.product-card',
            categoryCards: '.category-card',
            testimonialCards: '.testimonial-card',
            newsletterForm: '.newsletter-form',
            cartButtons: '[data-action="add-to-cart"]',
            scrollIndicator: '.scroll-indicator'
        },
        classes: {
            menuOpen: 'menu-open',
            scrolled: 'scrolled',
            visible: 'visible',
            active: 'active',
            loading: 'loading',
            success: 'success',
            mouseMove: 'mouse-move'
        },
        animations: {
            fadeIn: 'fade-in',
            slideIn: 'slide-in',
            pulse: 'pulse'
        }
    },

    // State management
    state: {
        isMenuOpen: false,
        isSearchOpen: false,
        cartItems: 0,
        products: [],
        notifications: [],
        lastScrollTop: 0,
        mouseMoveTimeout: null
    },

    // Initialize application
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initIntersectionObserver();
        this.initAccessibility();
        this.initCartSystem();
        this.initScrollEffects();
        this.initProductHover();
        this.initScrollIndicator();
        this.init3DEffects();
        this.initParticles();
    },

    // Cache DOM elements
    cacheDOM() {
        this.dom = {
            header: document.querySelector(this.config.selectors.header),
            nav: document.querySelector(this.config.selectors.nav),
            mobileMenu: document.querySelector(this.config.selectors.mobileMenu),
            searchForm: document.querySelector(this.config.selectors.searchForm),
            navToggle: document.querySelector(this.config.selectors.navToggle),
            navLinks: document.querySelectorAll(this.config.selectors.navLinks),
            animatedElements: document.querySelectorAll(this.config.selectors.animatedElements),
            productCards: document.querySelectorAll(this.config.selectors.productCards),
            categoryCards: document.querySelectorAll(this.config.selectors.categoryCards),
            testimonialCards: document.querySelectorAll(this.config.selectors.testimonialCards),
            newsletterForm: document.querySelector(this.config.selectors.newsletterForm),
            cartButtons: document.querySelectorAll(this.config.selectors.cartButtons),
            cartBadge: document.querySelector('.cart-badge'),
            scrollIndicator: document.querySelector(this.config.selectors.scrollIndicator)
        };
    },

    // Bind event listeners
    bindEvents() {
        // Mobile menu toggle
        this.dom.navToggle?.addEventListener('click', this.toggleMobileMenu.bind(this));

        // Close menu on outside click
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Navigation links
        this.dom.navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavLinkClick.bind(this));
        });

        // Scroll events
        this.handleScroll = this.debounce(this.updateHeaderOnScroll.bind(this), 100);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('scroll', this.updateScrollIndicator.bind(this));

        // Form submissions
        this.dom.searchForm?.addEventListener('submit', this.handleSearch.bind(this));
        this.dom.newsletterForm?.addEventListener('submit', this.handleNewsletterSignup.bind(this));
        
        // Cart functionality
        this.dom.cartButtons.forEach(button => {
            button.addEventListener('click', this.handleAddToCart.bind(this));
        });
        
        // Mouse move for 3D effects
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    },

    // Event Handlers
    toggleMobileMenu(event) {
        event.preventDefault();
        this.state.isMenuOpen = !this.state.isMenuOpen;
        this.dom.nav.classList.toggle(this.config.classes.menuOpen);
        this.dom.mobileMenu.setAttribute('aria-hidden', (!this.state.isMenuOpen).toString());
        this.dom.navToggle.setAttribute('aria-expanded', this.state.isMenuOpen.toString());
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
    },

    handleOutsideClick(event) {
        if (this.state.isMenuOpen && 
            !this.dom.nav.contains(event.target) && 
            !event.target.matches(this.config.selectors.navToggle)) {
            this.toggleMobileMenu(event);
        }
    },

    handleNavLinkClick(event) {
        const href = event.currentTarget.getAttribute('href');
        if (href.startsWith('#')) {
            event.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                this.smoothScrollTo(target);
                if (this.state.isMenuOpen) {
                    this.toggleMobileMenu(event);
                }
            }
        }
    },

    handleSearch(event) {
        event.preventDefault();
        // Implement search functionality
        const searchInput = event.target.querySelector('input[type="search"]');
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length > 0) {
            // Here you would typically send an AJAX request to a search endpoint
            console.log('Search submitted:', searchTerm);
            this.showNotification('Searching for: ' + searchTerm, 'info');
            // Reset the form
            searchInput.value = '';
        }
    },
    
    handleNewsletterSignup(event) {
        event.preventDefault();
        
        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email.length > 0) {
            form.classList.add(this.config.classes.loading);
            
            // Simulate API call
            setTimeout(() => {
                form.classList.remove(this.config.classes.loading);
                form.classList.add(this.config.classes.success);
                this.showNotification('Thanks for subscribing to our newsletter!', 'success');
                
                // Reset form after showing success
                setTimeout(() => {
                    form.reset();
                    form.classList.remove(this.config.classes.success);
                }, 3000);
            }, 1500);
        }
    },
    
    handleAddToCart(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        
        // Extract product ID from data attribute or class
        const productId = productCard.dataset.productId || productCard.id || this.getProductIdFromClasses(productCard);
        
        console.log('[GardenApp] Adding to cart:', productId, productTitle, productPrice);
        
        if (!productId) {
            console.error('[GardenApp] Product ID not found for', productCard);
            return;
        }
        
        // Add animation to the button
        button.classList.add('button-loading');
        
        // DIRECT CART MANIPULATION - Skip the event approach which may not be working
        setTimeout(() => {
            // Add the item directly to localStorage
            let cartData;
            try {
                const savedCart = localStorage.getItem('myGardenCart');
                cartData = savedCart ? JSON.parse(savedCart) : { items: [] };
            } catch (e) {
                console.error('[GardenApp] Error parsing cart data:', e);
                cartData = { items: [] };
            }
            
            // Find if item already exists
            const itemIndex = cartData.items.findIndex(item => item.id === productId);
            if (itemIndex !== -1) {
                cartData.items[itemIndex].quantity += 1;
            } else {
                cartData.items.push({
                    id: productId,
                    quantity: 1
                });
            }
            
            // Save back to localStorage
            localStorage.setItem('myGardenCart', JSON.stringify(cartData));
            console.log('[GardenApp] Saved cart data:', cartData);
            
            // Update badge count
            this.state.cartItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
            this.updateCartBadge();
            
            // Also try the event dispatch approach as backup
            if (window.shoppingCart) {
                console.log('[GardenApp] Using ShoppingCart system to refresh UI');
                window.shoppingCart.loadCart();
                window.shoppingCart.updateCartUI();
            }
            
            // Update button UI
            button.classList.remove('button-loading');
            button.classList.add('button-success');
            button.textContent = 'Added to Cart';
            
            // Show notification
            this.showNotification(`${productTitle} added to your cart`, 'success');
            
            // Reset button after delay
            setTimeout(() => {
                button.classList.remove('button-success');
                button.textContent = 'Add to Cart';
            }, 2000);
        }, 800);
    },
    
    getProductIdFromClasses(element) {
        // Extract product ID from class names
        const classes = element.className.split(' ');
        for (const className of classes) {
            if (className.startsWith('product-') && className !== 'product-card') {
                return className;
            }
        }
        
        // If no ID found in classes, generate one based on product title
        const title = element.querySelector('.product-title')?.textContent;
        if (title) {
            const category = element.closest('.product-category')?.dataset.category || 'product';
            return `${category.toLowerCase()}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
        }
        
        return null;
    },
    
    handleMouseMove(event) {
        // Add mouse move class to document
        document.body.classList.add(this.config.classes.mouseMove);
        
        // Clear existing timeout
        if (this.state.mouseMoveTimeout) {
            clearTimeout(this.state.mouseMoveTimeout);
        }
        
        // Set timeout to remove class
        this.state.mouseMoveTimeout = setTimeout(() => {
            document.body.classList.remove(this.config.classes.mouseMove);
        }, 300);
        
        // Apply 3D tilting effect to cards when mouse moves
        this.applyTiltEffect(event);
    },

    // Utility Methods
    updateHeaderOnScroll() {
        const scrolled = window.scrollY > 50;
        this.dom.header.classList.toggle(this.config.classes.scrolled, scrolled);
    },

    smoothScrollTo(element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    updateScrollIndicator() {
        if (!this.dom.scrollIndicator) return;
        
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        
        this.dom.scrollIndicator.style.width = `${scrolled}%`;
    },
    
    applyTiltEffect(event) {
        const cards = [...this.dom.testimonialCards, ...this.dom.productCards];
        
        cards.forEach(card => {
            // Check if card is in viewport
            const rect = card.getBoundingClientRect();
            if (
                rect.top >= -rect.height &&
                rect.left >= -rect.width &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) + rect.width
            ) {
                // Get card center
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                
                // Calculate mouse distance from center
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                
                // Calculate rotation values
                const maxRotation = 5; // Max rotation in degrees
                const rotateY = maxRotation * (mouseX - cardCenterX) / (rect.width / 2);
                const rotateX = -maxRotation * (mouseY - cardCenterY) / (rect.height / 2);
                
                // Apply transform but only if mouse is close to the card
                const distanceThreshold = Math.max(rect.width, rect.height) * 1.5;
                const distance = Math.sqrt(Math.pow(mouseX - cardCenterX, 2) + Math.pow(mouseY - cardCenterY, 2));
                
                if (distance < distanceThreshold) {
                    // Calculate transform intensity based on distance (closer = stronger effect)
                    const intensity = 1 - Math.min(1, distance / distanceThreshold);
                    card.style.transform = `
                        perspective(1000px) 
                        rotateX(${rotateX * intensity}deg) 
                        rotateY(${rotateY * intensity}deg)
                        translateY(-${intensity * 5}px)
                    `;
                } else {
                    card.style.transform = '';
                }
            }
        });
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getIconForNotificationType(type)}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add to DOM
        const notificationsContainer = document.querySelector('.notifications-container') || this.createNotificationsContainer();
        notificationsContainer.appendChild(notification);
        
        // Handle close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-hiding');
                setTimeout(() => {
                    notification.remove();
                    
                    // Remove container if it's empty
                    if (notificationsContainer.children.length === 0) {
                        notificationsContainer.remove();
                    }
                }, 300);
            }
        }, 5000);
    },
    
    getIconForNotificationType(type) {
        switch(type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            case 'info':
            default: return 'fas fa-info-circle';
        }
    },
    
    createNotificationsContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    },
    
    updateCartBadge() {
        if (this.dom.cartBadge) {
            this.dom.cartBadge.textContent = this.state.cartItems;
            this.dom.cartBadge.setAttribute('aria-label', `${this.state.cartItems} items in cart`);
            
            if (this.state.cartItems > 0) {
                this.dom.cartBadge.classList.add('has-items');
            }
            
            // Add animation
            this.dom.cartBadge.classList.add('cart-badge-updated');
            setTimeout(() => {
                this.dom.cartBadge.classList.remove('cart-badge-updated');
            }, 300);
        }
    },

    // Intersection Observer for animations
    initIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered animation delay based on index for child elements
                    const children = entry.target.querySelectorAll('.animate-child');
                    if (children.length) {
                        Array.from(children).forEach((child, index) => {
                            child.style.animationDelay = `${0.1 + (index * 0.1)}s`;
                            child.classList.add(this.config.classes.visible);
                        });
                    }
                    
                    entry.target.classList.add(this.config.classes.visible);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.dom.animatedElements.forEach(el => observer.observe(el));
    },
    
    initCartSystem() {
        // Initialize cart from local storage if available
        const savedCart = localStorage.getItem('myGardenCart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                this.state.cartItems = cartData.items ? cartData.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                this.updateCartBadge();
                console.log('GardenApp: Loaded cart with', this.state.cartItems, 'items');
            } catch (e) {
                console.error('Error loading cart data', e);
            }
        } else {
            // Try old format as fallback
            const oldCartItems = localStorage.getItem('cartItems');
            if (oldCartItems) {
                try {
                    const items = JSON.parse(oldCartItems);
                    this.state.cartItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    this.updateCartBadge();
                    console.log('GardenApp: Loaded cart from old format with', this.state.cartItems, 'items');
                } catch (e) {
                    console.error('Error loading old cart data', e);
                }
            }
        }
        
        // Update view-cart buttons to link to cart.html if they're not already handled
        if (!window.shoppingCart) {
            document.querySelectorAll('[data-action="view-cart"]').forEach(button => {
                button.addEventListener('click', () => {
                    window.location.href = 'cart.html';
                });
            });
        }
        
        // Listen for cart updates from ShoppingCart
        document.addEventListener('cart-updated', event => {
            if (event.detail && typeof event.detail.count === 'number') {
                this.state.cartItems = event.detail.count;
                this.updateCartBadge();
                console.log('GardenApp: Cart updated from event, now has', this.state.cartItems, 'items');
            }
        });
    },
    
    initScrollEffects() {
        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.scrollY;
                if (scrollPosition < window.innerHeight) {
                    heroSection.style.backgroundPositionY = `${scrollPosition * 0.2}px`;
                }
            });
        }
    },
    
    initScrollIndicator() {
        // Initialize scroll indicator
        if (this.dom.scrollIndicator) {
            this.updateScrollIndicator();
        }
    },
    
    init3DEffects() {
        // Apply subtle 3D effect on cards when page loads
        this.dom.productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = '';
            });
        });
        
        // Apply 3D effect to testimonial cards
        this.dom.testimonialCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease';
                card.style.transform = '';
            });
        });
    },
    
    initProductHover() {
        // Enhanced hover effects for product cards
        this.dom.productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const button = card.querySelector('.button');
                if (button) {
                    button.classList.add('button-hover-effect');
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const button = card.querySelector('.button');
                if (button) {
                    button.classList.remove('button-hover-effect');
                }
            });
        });
    },

    // Accessibility enhancements
    initAccessibility() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.toggleMobileMenu(e);
            }
        });

        // Trap focus in mobile menu when open
        this.trapFocus();
    },

    trapFocus() {
        const focusableElements = this.dom.mobileMenu?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements?.length) {
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            this.dom.mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }
    },

    // Initialize particles.js
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                "particles": {
                    "number": {
                        "value": 30,
                        "density": {
                            "enable": true,
                            "value_area": 1200
                        }
                    },
                    "color": {
                        "value": "#1a4d3c"
                    },
                    "shape": {
                        "type": "circle",
                        "stroke": {
                            "width": 0,
                            "color": "#000000"
                        },
                        "polygon": {
                            "nb_sides": 5
                        }
                    },
                    "opacity": {
                        "value": 0.2,
                        "random": false,
                        "anim": {
                            "enable": false,
                            "speed": 0.5,
                            "opacity_min": 0.1,
                            "sync": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "enable": false,
                            "speed": 20,
                            "size_min": 0.1,
                            "sync": false
                        }
                    },
                    "line_linked": {
                        "enable": true,
                        "distance": 250,
                        "color": "#1a4d3c",
                        "opacity": 0.2,
                        "width": 1
                    },
                    "move": {
                        "enable": true,
                        "speed": 0.8,
                        "direction": "none",
                        "random": false,
                        "straight": false,
                        "out_mode": "out",
                        "bounce": false,
                        "attract": {
                            "enable": false,
                            "rotateX": 300,
                            "rotateY": 600
                        }
                    }
                },
                "interactivity": {
                    "detect_on": "canvas",
                    "events": {
                        "onhover": {
                            "enable": false,
                            "mode": "grab"
                        },
                        "onclick": {
                            "enable": false,
                            "mode": "push"
                        },
                        "resize": true
                    },
                    "modes": {
                        "grab": {
                            "distance": 140,
                            "line_linked": {
                                "opacity": 1
                            }
                        },
                        "bubble": {
                            "distance": 400,
                            "size": 40,
                            "duration": 2,
                            "opacity": 8,
                            "speed": 3
                        },
                        "repulse": {
                            "distance": 200,
                            "duration": 0.4
                        },
                        "push": {
                            "particles_nb": 2
                        },
                        "remove": {
                            "particles_nb": 2
                        }
                    }
                },
                "retina_detect": false
            });
            
            // Add a helper to pause particles when page is not visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    pJSDom[0].pJS.particles.move.enable = false;
                } else {
                    pJSDom[0].pJS.particles.move.enable = true;
                }
            });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GardenApp.init();
    
    // Initialize Spline interaction
    initSplineInteraction();
});

// Function to handle Spline interaction
function initSplineInteraction() {
    const heroSection = document.querySelector('.hero-section, .category-hero-section');
    const splineContainer = document.querySelector('.spline-container');
    const splineIframe = document.querySelector('.spline-container iframe');
    
    if (heroSection && splineContainer && splineIframe) {
        // Check if device is low-powered
        const isLowPoweredDevice = () => {
            // Check for low-powered devices via browser hints or resolution/device detection
            const isLowRes = window.innerWidth < 768 || window.innerHeight < 600;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            // If battery API is available, check battery status
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    if (battery.level < 0.3 && !battery.charging) {
                        disableHeavyAnimations();
                    }
                });
            }
            return isLowRes || isMobile;
        };
        
        // Disable heavy animations for low-powered devices
        const disableHeavyAnimations = () => {
            splineIframe.style.display = 'none';
            document.documentElement.classList.add('low-power-mode');
        };
        
        // Check if we should enable lightweight mode
        if (isLowPoweredDevice()) {
            disableHeavyAnimations();
        }
        
        // Use Intersection Observer to efficiently detect when the hero section is visible
        // This ensures we only animate when the section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    // Pause animations when not in view
                    splineContainer.style.willChange = 'auto';
                    document.documentElement.classList.add('hero-offscreen');
                } else {
                    // Resume animations when in view
                    splineContainer.style.willChange = 'transform, opacity';
                    document.documentElement.classList.remove('hero-offscreen');
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px 50px 0px' // Start loading a bit before it comes into view
        });
        
        observer.observe(heroSection);
        
        // Optimized scroll handler with requestAnimationFrame
        let lastScrollY = window.scrollY;
        let scrollTicking = false;
        
        // Use a passive scroll event for best performance (tells browser we won't preventDefault)
        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            
            // Skip processing if we're already handling a frame or element is offscreen
            if (scrollTicking || document.documentElement.classList.contains('hero-offscreen')) {
                return;
            }
            
            scrollTicking = true;
            
            // Use requestAnimationFrame to optimize visual updates
            window.requestAnimationFrame(() => {
                const heroHeight = heroSection.offsetHeight;
                const scrollPercentage = Math.min(1, lastScrollY / (heroHeight * 0.7));
                
                // Only apply changes if meaningful and visible
                if (scrollPercentage < 1) {
                    // Batch visual updates for better performance
                    const opacity = Math.max(0, (1 - scrollPercentage).toFixed(2));
                    const yOffset = Math.floor(lastScrollY * 0.03); // Integer values for smoother rendering
                    
                    splineContainer.style.cssText = `
                        opacity: ${opacity};
                        transform: translate3d(0, ${yOffset}px, 0);
                    `;
                }
                
                scrollTicking = false;
            });
        }, { passive: true });
        
        // Super optimized mouse movement handling for desktop
        if (window.innerWidth > 768 && !isLowPoweredDevice()) {
            let isInHeroSection = false;
            let mouseMoveTimeout;
            let animationFrameId = null;
            
            // Only track mouse movements when cursor is in hero section
            heroSection.addEventListener('mouseenter', () => {
                isInHeroSection = true;
            }, { passive: true });
            
            heroSection.addEventListener('mouseleave', () => {
                isInHeroSection = false;
                // Reset position when mouse leaves
                if (splineIframe) {
                    cancelAnimationFrame(animationFrameId);
                    splineIframe.style.transform = 'translate3d(-50%, -50%, 0) scale(1.2)';
                }
            }, { passive: true });
            
            // Throttle mouse movements to 60fps maximum rate
            // This significantly improves performance while maintaining smoothness
            let lastMouseMoveTime = 0;
            const throttleRate = 1000 / 30; // 30fps is plenty smooth for mouse effects
            
            document.addEventListener('mousemove', (event) => {
                // Skip if not in hero section or low-power mode
                if (!isInHeroSection || document.documentElement.classList.contains('low-power-mode')) {
                    return;
                }
                
                const now = performance.now();
                if (now - lastMouseMoveTime < throttleRate) {
                    return; // Skip frames to maintain our throttle rate
                }
                
                lastMouseMoveTime = now;
                
                // Store mouse coordinates
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                
                // Cancel any scheduled animation frame to avoid wasteful calculations
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
                
                // Schedule the visual update at the next frame
                animationFrameId = requestAnimationFrame(() => {
                    const rect = heroSection.getBoundingClientRect();
                    
                    // Ensure calculations only happen if we're still in the section
                    if (!isInHeroSection) return;
                    
                    // Integer-only calculations for better performance
                    const centerX = Math.floor(((mouseX - rect.left) / rect.width - 0.5) * 3);
                    const centerY = Math.floor(((mouseY - rect.top) / rect.height - 0.5) * 3);
                    
                    // Apply transform with minimal properties changed - using CSS transform directly
                    // is faster than accessing the DOM multiple times
                    if (splineIframe) {
                        // Store transform matrix to avoid reflow/layout thrashing
                        // This is a critical optimization for smooth performance
                        // We use translate3d for GPU acceleration
                        splineIframe.style.transform = `translate3d(calc(-50% + ${centerX}px), calc(-50% + ${centerY}px), 0) scale(1.2)`;
                    }
                });
            }, { passive: true });
        }
        
        // Defer 3D iframe loading to improve initial page load performance
        if (splineIframe && splineIframe.dataset.src) {
            // Load the iframe after the page has loaded
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (!document.documentElement.classList.contains('low-power-mode')) {
                        splineIframe.src = splineIframe.dataset.src;
                    }
                }, 1000); // Delay loading by 1 second after page load
            });
        }
    }
}

// Handle service worker for PWA support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.error('ServiceWorker registration failed:', err);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Use the GardenApp's particle initialization instead of duplicating it
    // Remove duplicate particlesJS initialization to avoid performance issues
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Shopping cart functionality
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartButton = document.querySelector('.cart-button');
    const cartCounter = document.querySelector('.cart-counter');
    
    // Update cart counter
    if (cartCounter) {
        cartCounter.textContent = cartItems.length;
        if (cartItems.length > 0) {
            cartCounter.classList.add('active');
        }
    }

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const product = {
                id: card.dataset.productId || Math.random().toString(36).substr(2, 9),
                name: card.querySelector('.product-title').textContent,
                price: card.querySelector('.product-price').textContent,
                image: card.querySelector('.product-image').getAttribute('src'),
                quantity: 1
            };
            
            // Check if product already exists in cart
            const existingProductIndex = cartItems.findIndex(item => item.id === product.id);
            if (existingProductIndex > -1) {
                cartItems[existingProductIndex].quantity += 1;
            } else {
                cartItems.push(product);
            }
            
            // Save to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            
            // Update cart counter
            if (cartCounter) {
                cartCounter.textContent = cartItems.length;
                cartCounter.classList.add('active');
            }
            
            // Show toast notification
            showToast(`${product.name} added to cart!`);
        });
    });

    // Toast notification function
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Filter functionality for product pages
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    if (card.dataset.category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
});