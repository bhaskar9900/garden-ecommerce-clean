/**
 * Supabase integration for Garden E-Commerce Platform
 * This file initializes the Supabase client and provides API functions
 * for interacting with the Supabase backend.
 */

// Set your Supabase project credentials
const SUPABASE_URL = 'https://ktaznqxiclyictwlgkeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YXpucXhpY2x5aWN0d2xna2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODE0MzQsImV4cCI6MjA1OTg1NzQzNH0.LkAP572Qn3Du5I3Kkrp7B5RbOR0GtXV8YbaFzPe25YE';

// MCP Server configuration - Direct PostgreSQL connection
const MCP_SERVER_URL = 'postgresql://postgres.ktaznqxiclyictwlgkeb:Bhaskar@99@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
const MCP_API_KEY = null; // Not needed for direct DB connection

// Initialize the Supabase client with MCP configuration
const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'x-supabase-db-connection': MCP_SERVER_URL
        }
    }
});

// Create a namespace for our Supabase functions
const SupabaseAPI = {
    // User Authentication
    auth: {
        /**
         * Sign up a new user
         * @param {string} email - User's email
         * @param {string} password - User's password
         * @param {object} metadata - Additional user data
         * @returns {Promise} - Signup result
         */
        signUp: async (email, password, metadata = {}) => {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: metadata }
                });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error signing up:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Sign in an existing user
         * @param {string} email - User's email
         * @param {string} password - User's password
         * @returns {Promise} - Login result
         */
        signIn: async (email, password) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                // Store user in localStorage for session persistence
                if (data.user) {
                    localStorage.setItem('garden_user', JSON.stringify(data.user));
                }
                
                return { success: true, data };
            } catch (error) {
                console.error('Error signing in:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Sign in with a third-party provider
         * @param {string} provider - Provider ('google', 'facebook', etc.)
         * @returns {Promise} - OAuth result
         */
        signInWithProvider: async (provider) => {
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider
                });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error(`Error signing in with ${provider}:`, error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Sign out the current user
         * @returns {Promise} - Logout result
         */
        signOut: async () => {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                // Clean up local user data
                localStorage.removeItem('garden_user');
                
                return { success: true };
            } catch (error) {
                console.error('Error signing out:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get the current user
         * @returns {Object} - Current user or null
         */
        getCurrentUser: async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                
                if (error) throw error;
                return data.user;
            } catch (error) {
                console.error('Error getting current user:', error.message);
                return null;
            }
        },
        
        /**
         * Reset user's password
         * @param {string} email - User's email
         * @returns {Promise} - Password reset result
         */
        resetPassword: async (email) => {
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Error resetting password:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Products
    products: {
        /**
         * Get all products
         * @param {object} options - Query options (limit, category, etc.)
         * @returns {Promise} - Products data
         */
        getAll: async (options = {}) => {
            try {
                let query = supabase
                    .from('products')
                    .select('*');
                
                // Apply filters if provided
                if (options.category) {
                    query = query.eq('category', options.category);
                }
                
                // Apply limits if provided
                if (options.limit) {
                    query = query.limit(options.limit);
                }
                
                const { data, error } = await query;
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching products:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get a single product by ID
         * @param {string} id - Product ID
         * @returns {Promise} - Product data
         */
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error(`Error fetching product ${id}:`, error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get featured products
         * @param {number} limit - Number of products to fetch
         * @returns {Promise} - Featured products data
         */
        getFeatured: async (limit = 4) => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_featured', true)
                    .limit(limit);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching featured products:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Search products
         * @param {string} query - Search query
         * @returns {Promise} - Search results
         */
        search: async (query) => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${query}%, description.ilike.%${query}%`);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error searching products:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Orders
    orders: {
        /**
         * Create a new order
         * @param {object} orderData - Order details
         * @returns {Promise} - New order result
         */
        create: async (orderData) => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .insert(orderData)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error creating order:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get user orders
         * @param {string} userId - User ID
         * @returns {Promise} - User orders
         */
        getUserOrders: async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching user orders:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get a single order by ID
         * @param {string} id - Order ID
         * @returns {Promise} - Order data
         */
        getById: async (id) => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error(`Error fetching order ${id}:`, error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // User Profiles
    profiles: {
        /**
         * Get user profile
         * @param {string} userId - User ID
         * @returns {Promise} - User profile
         */
        get: async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching user profile:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Update user profile
         * @param {string} userId - User ID
         * @param {object} updates - Profile updates
         * @returns {Promise} - Update result
         */
        update: async (userId, updates) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', userId)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error updating user profile:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Shopping Cart
    cart: {
        /**
         * Sync local cart with Supabase (for logged in users)
         * @param {string} userId - User ID
         * @param {array} cartItems - Local cart items
         * @returns {Promise} - Sync result
         */
        sync: async (userId, cartItems) => {
            if (!userId) return { success: false, error: 'User not logged in' };
            
            try {
                // First, get user's server cart
                const { data: existingCart, error: fetchError } = await supabase
                    .from('carts')
                    .select('*')
                    .eq('user_id', userId);
                
                if (fetchError) throw fetchError;
                
                // Merge local cart with server cart
                const mergedItems = [...cartItems];
                
                // Insert or update the cart
                const { data, error } = await supabase
                    .from('carts')
                    .upsert({
                        user_id: userId,
                        items: mergedItems,
                        updated_at: new Date()
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error syncing cart:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get user's cart from Supabase
         * @param {string} userId - User ID
         * @returns {Promise} - Cart data
         */
        get: async (userId) => {
            if (!userId) return { success: false, error: 'User not logged in' };
            
            try {
                const { data, error } = await supabase
                    .from('carts')
                    .select('*')
                    .eq('user_id', userId)
                    .single();
                
                if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
                
                return { 
                    success: true, 
                    data: data || { user_id: userId, items: [] } 
                };
            } catch (error) {
                console.error('Error fetching cart:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Wishlist
    wishlist: {
        /**
         * Add product to wishlist
         * @param {string} userId - User ID
         * @param {string} productId - Product ID
         * @returns {Promise} - Add result
         */
        add: async (userId, productId) => {
            if (!userId) return { success: false, error: 'User not logged in' };
            
            try {
                const { data, error } = await supabase
                    .from('wishlists')
                    .insert({
                        user_id: userId,
                        product_id: productId
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error adding to wishlist:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Remove product from wishlist
         * @param {string} userId - User ID
         * @param {string} productId - Product ID
         * @returns {Promise} - Remove result
         */
        remove: async (userId, productId) => {
            if (!userId) return { success: false, error: 'User not logged in' };
            
            try {
                const { error } = await supabase
                    .from('wishlists')
                    .delete()
                    .match({ user_id: userId, product_id: productId });
                
                if (error) throw error;
                return { success: true };
            } catch (error) {
                console.error('Error removing from wishlist:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get user's wishlist
         * @param {string} userId - User ID
         * @returns {Promise} - Wishlist data
         */
        get: async (userId) => {
            if (!userId) return { success: false, error: 'User not logged in' };
            
            try {
                const { data, error } = await supabase
                    .from('wishlists')
                    .select('*, products(*)')
                    .eq('user_id', userId);
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching wishlist:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Reviews
    reviews: {
        /**
         * Add a product review
         * @param {object} reviewData - Review details
         * @returns {Promise} - Add result
         */
        add: async (reviewData) => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .insert(reviewData)
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error adding review:', error.message);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Get reviews for a product
         * @param {string} productId - Product ID
         * @returns {Promise} - Reviews data
         */
        getForProduct: async (productId) => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*, profiles(first_name, last_name, avatar_url)')
                    .eq('product_id', productId)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Error fetching product reviews:', error.message);
                return { success: false, error: error.message };
            }
        }
    },
    
    // Newsletter
    newsletter: {
        /**
         * Subscribe to newsletter
         * @param {string} email - User's email
         * @param {boolean} marketing_consent - Marketing consent
         * @returns {Promise} - Subscription result
         */
        subscribe: async (email, marketing_consent = true) => {
            try {
                const { data, error } = await supabase
                    .from('newsletter_subscriptions')
                    .insert({
                        email,
                        marketing_consent,
                        subscribed_at: new Date()
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                // Check if it's a unique violation (already subscribed)
                if (error.code === '23505') {
                    return { 
                        success: false, 
                        error: 'This email is already subscribed to our newsletter.'
                    };
                }
                
                console.error('Error subscribing to newsletter:', error.message);
                return { success: false, error: error.message };
            }
        }
    }
};

// Initialize Supabase and check the current auth state
(async function initSupabase() {
    try {
        // Check if user is already logged in
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            console.log('User is logged in:', user.email);
            // Store user data in localStorage
            localStorage.setItem('garden_user', JSON.stringify(user));
            
            // Get user's cart from Supabase and merge with local cart
            if (window.GardenApp) {
                const localCart = JSON.parse(localStorage.getItem('myGardenCart') || '{"items":[]}');
                
                // Sync with server
                const { success, data: serverCart } = await SupabaseAPI.cart.sync(
                    user.id, 
                    localCart.items || []
                );
                
                if (success && serverCart) {
                    // Update local cart with server data
                    localStorage.setItem('myGardenCart', JSON.stringify({
                        items: serverCart.items || []
                    }));
                    
                    // Update cart UI
                    if (window.GardenApp.updateCartBadge) {
                        window.GardenApp.state.cartItems = (serverCart.items || []).length;
                        window.GardenApp.updateCartBadge();
                    }
                }
            }
            
            // Add logged-in class to body
            document.body.classList.add('logged-in');
            
            // Update any UI elements that should reflect login state
            const accountLinks = document.querySelectorAll('.nav-link[href="account.html"]');
            accountLinks.forEach(link => {
                link.textContent = 'My Account';
            });
        } else {
            console.log('User is not logged in');
            document.body.classList.remove('logged-in');
        }
    } catch (error) {
        console.error('Error initializing Supabase:', error.message);
    }
})();

// Make SupabaseAPI available globally
window.SupabaseAPI = SupabaseAPI; 