/**
 * Authentication Configuration for Garden E-Commerce Platform
 * Centralizes authentication settings and defines user profile schema
 */

// Authentication Configuration
const AuthConfig = {
    // URLs for redirects
    redirects: {
        afterSignIn: 'account.html',  // Where to redirect after successful sign in
        afterSignUp: 'account.html',  // Where to redirect after successful sign up
        afterSignOut: 'index.html'    // Where to redirect after sign out
    },
    
    // Session storage keys
    storage: {
        userKey: 'garden_user',       // Key for storing user data in localStorage
        sessionKey: 'garden_session'  // Key for storing session data in localStorage
    },
    
    // User profile fields
    profileFields: [
        'id',
        'email',
        'full_name',
        'phone',
        'avatar_url',
        'address_id',
        'created_at',
        'updated_at'
    ],
    
    // OAuth providers configuration
    providers: {
        google: {
            scopes: 'email profile'
        },
        facebook: {
            scopes: 'email,public_profile'
        }
    }
};

// User profile management functions
const UserProfileManager = {
    /**
     * Create or update user profile in the database
     * @param {Object} user - User object from Supabase Auth
     * @returns {Promise} - Result of the operation
     */
    createOrUpdateProfile: async (user) => {
        if (!user || !user.id) return { success: false, error: 'Invalid user data' };
        
        try {
            // Extract profile data from user object
            const profileData = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name,
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
            };
            
            // Insert data, but if the record exists, update it
            const { data, error } = await supabase
                .from('users')
                .upsert(profileData, { 
                    onConflict: 'id',
                    returning: 'minimal'
                });
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Get user profile from database
     * @param {string} userId - User ID
     * @returns {Promise} - User profile data
     */
    getProfile: async (userId) => {
        if (!userId) return { success: false, error: 'User ID is required' };
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Update specific user profile fields
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise} - Result of the operation
     */
    updateProfile: async (userId, updates) => {
        if (!userId) return { success: false, error: 'User ID is required' };
        if (!updates || Object.keys(updates).length === 0) {
            return { success: false, error: 'No update data provided' };
        }
        
        try {
            // Always update the updated_at timestamp
            updates.updated_at = new Date().toISOString();
            
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }
}; 