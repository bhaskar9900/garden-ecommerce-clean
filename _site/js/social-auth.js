/**
 * Social authentication functionality for Garden E-Commerce Platform
 * Integrates with Google and Facebook login using Supabase OAuth
 */

// Initialize the auth providers on document load
document.addEventListener('DOMContentLoaded', function() {
    // Set up Google Sign-In
    const googleLoginButtons = document.querySelectorAll('.google-login');
    googleLoginButtons.forEach(button => {
        button.addEventListener('click', handleGoogleSignIn);
    });

    // Set up Facebook Login
    const facebookLoginButtons = document.querySelectorAll('.facebook-login');
    facebookLoginButtons.forEach(button => {
        button.addEventListener('click', handleFacebookSignIn);
    });

    // Check for existing session
    checkAuthSession();
});

/**
 * Check if user has an existing auth session
 */
async function checkAuthSession() {
    try {
        const user = await SupabaseAPI.auth.getCurrentUser();
        
        if (user) {
            console.log('User is already logged in:', user);
            
            // If we're on the account page and user is logged in,
            // update the UI accordingly
            if (window.location.pathname.includes('account.html') && 
                typeof showLoggedInState === 'function') {
                showLoggedInState(user);
            }
        }
    } catch (error) {
        console.error('Error checking auth session:', error);
    }
}

/**
 * Handle Google Sign-In
 * @param {Event} event - Click event
 */
async function handleGoogleSignIn(event) {
    event.preventDefault();
    
    // Show loading state on button
    const button = event.currentTarget;
    const originalText = button.textContent;
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    try {
        // Use Supabase OAuth for Google login with scopes from AuthConfig
        const options = {
            provider: 'google',
            options: {
                scopes: AuthConfig?.providers?.google?.scopes || 'email profile',
                redirectTo: `${window.location.origin}/${AuthConfig?.redirects?.afterSignIn || 'account.html'}`
            }
        };
        
        // Use Supabase OAuth for Google login
        const result = await SupabaseAPI.auth.signInWithProvider(options.provider, options.options);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // The OAuth redirect will handle successful login
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed: ' + error.message);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

/**
 * Handle Facebook Sign-In
 * @param {Event} event - Click event
 */
async function handleFacebookSignIn(event) {
    event.preventDefault();
    
    // Show loading state on button
    const button = event.currentTarget;
    const originalText = button.textContent;
    button.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Connecting...';
    button.disabled = true;
    
    try {
        // Use Supabase OAuth for Facebook login with scopes from AuthConfig
        const options = {
            provider: 'facebook',
            options: {
                scopes: AuthConfig?.providers?.facebook?.scopes || 'email,public_profile',
                redirectTo: `${window.location.origin}/${AuthConfig?.redirects?.afterSignIn || 'account.html'}`
            }
        };
        
        // Use Supabase OAuth for Facebook login
        const result = await SupabaseAPI.auth.signInWithProvider(options.provider, options.options);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // The OAuth redirect will handle successful login
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        alert('Facebook sign-in failed: ' + error.message);
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Handle OAuth redirect when returning from authentication provider
(function handleAuthRedirect() {
    // Check if we have a hash fragment from OAuth redirect
    if (window.location.hash || window.location.search.includes('session_id')) {
        // Process the hash with Supabase
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                try {
                    // Store user in localStorage using AuthConfig key
                    localStorage.setItem(
                        AuthConfig?.storage?.userKey || 'garden_user', 
                        JSON.stringify(session.user)
                    );
                    
                    // Create or update user profile in Supabase
                    if (typeof UserProfileManager !== 'undefined') {
                        await UserProfileManager.createOrUpdateProfile(session.user);
                    }
                    
                    // Show success message
                    console.log('Login successful!');
                    
                    // Clear the hash fragment
                    window.history.replaceState(null, '', window.location.pathname);
                    
                    // If we're on the account page, update UI
                    if (window.location.pathname.includes('account.html') && 
                        typeof showLoggedInState === 'function') {
                        showLoggedInState(session.user);
                    } else {
                        // Redirect to account page
                        window.location.href = AuthConfig?.redirects?.afterSignIn || 'account.html';
                    }
                } catch (error) {
                    console.error('Error during auth redirect handling:', error);
                }
            }
        });
    }
})(); 