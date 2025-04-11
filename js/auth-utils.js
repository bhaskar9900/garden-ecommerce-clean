/**
 * Authentication Utilities for Garden E-Commerce Platform
 * Extends the functionality of auth-config.js with utility functions
 * to make working with user authentication easier
 */

// Extend the authentication API
(function extendAuthAPI() {
    // Make sure SupabaseAPI exists
    if (typeof SupabaseAPI === 'undefined' || !SupabaseAPI.auth) {
        console.error('SupabaseAPI not found. Make sure supabase.js is loaded first.');
        return;
    }
    
    // Add user profile management functions to SupabaseAPI
    SupabaseAPI.profiles = {
        /**
         * Get current user's profile from database
         * @returns {Promise} - User profile data
         */
        getCurrentProfile: async () => {
            try {
                // Get current user first
                const user = await SupabaseAPI.auth.getCurrentUser();
                if (!user) {
                    return { success: false, error: 'No authenticated user found' };
                }
                
                // Then get their profile
                return await UserProfileManager.getProfile(user.id);
            } catch (error) {
                console.error('Error getting current profile:', error);
                return { success: false, error: error.message };
            }
        },
        
        /**
         * Update current user's profile
         * @param {Object} updates - Fields to update
         * @returns {Promise} - Result of the operation
         */
        updateCurrentProfile: async (updates) => {
            try {
                // Get current user first
                const user = await SupabaseAPI.auth.getCurrentUser();
                if (!user) {
                    return { success: false, error: 'No authenticated user found' };
                }
                
                // Then update their profile
                return await UserProfileManager.updateProfile(user.id, updates);
            } catch (error) {
                console.error('Error updating current profile:', error);
                return { success: false, error: error.message };
            }
        }
    };
})();

/**
 * Enhanced showLoggedInState function that fetches and displays user profile data
 * @param {Object} user - User object from Supabase Auth
 */
async function showLoggedInState(user) {
    if (!user) return;
    
    // Show loading state
    const userInfoContainer = document.getElementById('user-info-container');
    if (userInfoContainer) {
        userInfoContainer.innerHTML = '<div class="loading">Loading user profile...</div>';
        userInfoContainer.style.display = 'block';
    }
    
    try {
        // Hide login/register forms if they exist
        const accountTabs = document.querySelector('.account-tabs');
        const accountForms = document.querySelector('.account-forms');
        
        if (accountTabs) accountTabs.style.display = 'none';
        if (accountForms) accountForms.style.display = 'none';
        
        // Get full profile from database
        const profileResult = await SupabaseAPI.profiles.getCurrentProfile();
        let profile = null;
        
        if (profileResult.success && profileResult.data) {
            profile = profileResult.data;
        }
        
        // Fallback to basic auth data if profile fetch failed
        const userData = profile || {
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            avatar_url: user.user_metadata?.avatar_url
        };
        
        // Get address if available
        let addressHTML = '<p>No address on file</p>';
        if (profile && profile.address_id) {
            try {
                const { data: address } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', profile.address_id)
                    .single();
                
                if (address) {
                    addressHTML = `
                        <p>${address.street_address}</p>
                        <p>${address.city}, ${address.state} ${address.postal_code}</p>
                        <p>${address.country}</p>
                    `;
                }
            } catch (error) {
                console.error('Error fetching address:', error);
            }
        }
        
        // Format date
        const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';
        
        // Display user info
        if (userInfoContainer) {
            userInfoContainer.innerHTML = `
                <div class="user-profile">
                    <div class="user-header">
                        ${userData.avatar_url ? `<img src="${userData.avatar_url}" alt="Profile" class="user-avatar">` : ''}
                        <h2>Welcome, ${userData.full_name || userData.email}</h2>
                    </div>
                    
                    <div class="user-details">
                        <div class="user-section">
                            <h3>Account Information</h3>
                            <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${userData.phone || 'Not provided'}</p>
                            <p><strong>Member since:</strong> ${joinDate}</p>
                        </div>
                        
                        <div class="user-section">
                            <h3>Shipping Address</h3>
                            ${addressHTML}
                        </div>
                    </div>
                    
                    <div class="account-actions">
                        <h3>Account Management</h3>
                        <ul>
                            <li><a href="orders.html">View Orders</a></li>
                            <li><a href="wishlist.html">View Wishlist</a></li>
                            <li><a href="#" id="edit-profile-btn">Edit Profile</a></li>
                        </ul>
                        <button id="logout-btn" class="btn btn-primary">Logout</button>
                    </div>
                </div>
            `;
            
            // Add logout functionality
            document.getElementById('logout-btn').addEventListener('click', async function() {
                const result = await SupabaseAPI.auth.signOut();
                
                if (result.success) {
                    alert('You have been logged out successfully');
                    window.location.href = AuthConfig?.redirects?.afterSignOut || 'index.html';
                } else {
                    alert('Error logging out: ' + result.error);
                }
            });
            
            // Add edit profile functionality
            const editProfileBtn = document.getElementById('edit-profile-btn');
            if (editProfileBtn) {
                editProfileBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Show edit profile form (to be implemented)
                    alert('Edit profile feature coming soon!');
                });
            }
        }
    } catch (error) {
        console.error('Error showing logged in state:', error);
        
        if (userInfoContainer) {
            userInfoContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error loading profile</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
} 