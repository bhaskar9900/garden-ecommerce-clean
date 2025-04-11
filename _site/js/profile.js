document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client from supabase.js file
    const { supabase } = window.SupabaseAPI;
    
    // DOM elements - Profile tabs
    const tabProfile = document.getElementById('tab-profile');
    const tabOrders = document.getElementById('tab-orders');
    const tabAddresses = document.getElementById('tab-addresses');
    
    // DOM elements - Content sections
    const contentProfile = document.getElementById('content-profile');
    const contentOrders = document.getElementById('content-orders');
    const contentAddresses = document.getElementById('content-addresses');
    
    // DOM elements - Profile information
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    const logoutBtn = document.getElementById('btn-logout');
    
    // DOM elements - Profile form
    const profileForm = document.getElementById('profile-form');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const avatarInput = document.getElementById('avatar');
    
    // DOM elements - Orders and addresses containers
    const ordersContainer = document.getElementById('orders-container');
    const addressesContainer = document.getElementById('addresses-container');
    
    // DOM elements - Address related
    const addAddressBtn = document.getElementById('btn-add-address');
    const addressModal = document.getElementById('address-modal');
    const addressForm = document.getElementById('address-form');
    const addressModalTitle = document.getElementById('address-modal-title');
    const cancelAddressBtn = document.getElementById('btn-cancel-address');
    
    // DOM elements - Delete address modal
    const deleteAddressModal = document.getElementById('delete-address-modal');
    const deleteAddressId = document.getElementById('delete-address-id');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
    const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
    
    // DOM elements - Cancel order modal
    const cancelOrderModal = document.getElementById('cancel-order-modal');
    const cancelOrderId = document.getElementById('cancel-order-id');
    const confirmCancelOrderBtn = document.getElementById('btn-confirm-cancel-order');
    const cancelCancelOrderBtn = document.getElementById('btn-cancel-cancel-order');
    
    // DOM elements - Notification
    const notification = document.getElementById('notification');
    
    // Current user
    let currentUser = null;
    
    // Tab switching functionality
    function switchTab(tabElement, contentToShow) {
        // Remove active class from all tabs and content
        [tabProfile, tabOrders, tabAddresses].forEach(tab => tab.classList.remove('active'));
        [contentProfile, contentOrders, contentAddresses].forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        tabElement.classList.add('active');
        contentToShow.classList.add('active');
    }
    
    // Event listeners for tabs
    tabProfile.addEventListener('click', () => switchTab(tabProfile, contentProfile));
    tabOrders.addEventListener('click', () => {
        switchTab(tabOrders, contentOrders);
        loadUserOrders();
    });
    tabAddresses.addEventListener('click', () => {
        switchTab(tabAddresses, contentAddresses);
        loadUserAddresses();
    });
    
    // Load and display user data
    async function loadUserData() {
        try {
            // Get session data
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                throw new Error('Error getting session');
            }
            
            if (!session) {
                // Redirect to login page if no session
                window.location.href = 'account.html';
                return;
            }
            
            currentUser = session.user;
            
            // Get user profile data from users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', currentUser.id)
                .single();
                
            if (userError) {
                throw new Error('Error fetching user data');
            }
            
            // Update UI with user data
            if (userData) {
                profileName.textContent = userData.full_name || 'User';
                profileEmail.textContent = userData.email;
                
                if (userData.avatar_url) {
                    profileAvatar.src = userData.avatar_url;
                }
                
                // Populate form fields
                fullNameInput.value = userData.full_name || '';
                emailInput.value = userData.email || '';
                phoneInput.value = userData.phone || '';
                avatarInput.value = userData.avatar_url || '';
                
                // Load orders and addresses
                loadUserOrders();
                loadUserAddresses();
            }
        } catch (error) {
            console.error('Error loading user data:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Load and display user orders
    async function loadUserOrders() {
        if (!currentUser) return;
        
        try {
            // Get user orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items:order_items(
                        *,
                        product:products(name, image_url)
                    )
                `)
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
                
            if (ordersError) {
                throw new Error('Error fetching orders');
            }
            
            // Clear existing orders
            ordersContainer.innerHTML = '';
            
            // Display orders or empty message
            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    const orderElement = document.createElement('div');
                    orderElement.className = 'order-card';
                    
                    // Format date
                    const orderDate = new Date(order.created_at);
                    const formattedDate = orderDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    // Determine status class
                    const statusClass = `status-${order.status.toLowerCase()}`;
                    
                    // Create order HTML
                    orderElement.innerHTML = `
                        <div class="order-header">
                            <div class="order-id">Order #${order.id.substring(0, 8)}</div>
                            <div class="order-status ${statusClass}">${order.status}</div>
                        </div>
                        <div class="order-details">
                            <div class="order-info">
                                <span class="order-label">Date</span>
                                <span class="order-value">${formattedDate}</span>
                            </div>
                            <div class="order-info">
                                <span class="order-label">Total</span>
                                <span class="order-value">$${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div class="order-info">
                                <span class="order-label">Payment</span>
                                <span class="order-value">${order.payment_method.replace('_', ' ')}</span>
                            </div>
                            <div class="order-info">
                                <span class="order-label">Shipping</span>
                                <span class="order-value">${order.shipping_method.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="btn-order btn-view-order" data-order-id="${order.id}">View Details</button>
                            ${(order.status === 'pending' || order.status === 'processing') ? 
                              `<button class="btn-order btn-cancel-order" data-order-id="${order.id}">Cancel Order</button>` : ''}
                        </div>
                    `;
                    
                    ordersContainer.appendChild(orderElement);
                });
                
                // Add event listeners to order action buttons
                document.querySelectorAll('.btn-view-order').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const orderId = e.target.getAttribute('data-order-id');
                        window.location.href = `order-detail.html?id=${orderId}`;
                    });
                });
                
                document.querySelectorAll('.btn-cancel-order').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const orderId = e.target.getAttribute('data-order-id');
                        cancelOrderId.value = orderId;
                        cancelOrderModal.style.display = 'block';
                    });
                });
            } else {
                ordersContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-bag"></i>
                        <p>You haven't placed any orders yet.</p>
                        <a href="shop.html" class="btn-primary btn-modal">Start Shopping</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading orders:', error.message);
            showNotification(error.message, 'notification-error');
            
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load orders. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Load and display user addresses
    async function loadUserAddresses() {
        if (!currentUser) return;
        
        try {
            // Get user addresses
            const { data: addresses, error: addressesError } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', currentUser.id);
                
            if (addressesError) {
                throw new Error('Error fetching addresses');
            }
            
            // Clear existing addresses
            addressesContainer.innerHTML = '';
            
            // Display addresses or empty message
            if (addresses && addresses.length > 0) {
                addresses.forEach(address => {
                    const addressElement = document.createElement('div');
                    addressElement.className = 'address-card';
                    
                    addressElement.innerHTML = `
                        ${address.is_default ? '<div class="address-default">Default</div>' : ''}
                        <div class="address-line">${address.street_address}</div>
                        <div class="address-line">${address.city}, ${address.state} ${address.postal_code}</div>
                        <div class="address-line">${address.country}</div>
                        <div class="address-actions">
                            <button class="btn-address btn-edit" data-address-id="${address.id}">Edit</button>
                            <button class="btn-address btn-delete" data-address-id="${address.id}">Delete</button>
                            ${!address.is_default ? `<button class="btn-address btn-default" data-address-id="${address.id}">Set Default</button>` : ''}
                        </div>
                    `;
                    
                    addressesContainer.appendChild(addressElement);
                });
                
                // Add event listeners for address actions
                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const addressId = e.target.getAttribute('data-address-id');
                        editAddress(addressId);
                    });
                });
                
                document.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const addressId = e.target.getAttribute('data-address-id');
                        deleteAddressId.value = addressId;
                        deleteAddressModal.style.display = 'block';
                    });
                });
                
                document.querySelectorAll('.btn-default').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const addressId = e.target.getAttribute('data-address-id');
                        setDefaultAddress(addressId);
                    });
                });
            } else {
                addressesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-map-marker-alt"></i>
                        <p>You haven't added any addresses yet.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading addresses:', error.message);
            showNotification(error.message, 'notification-error');
            
            addressesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load addresses. Please try again.</p>
                </div>
            `;
        }
    }
    
    // Set address as default
    async function setDefaultAddress(addressId) {
        if (!currentUser || !addressId) return;
        
        try {
            // First, set all addresses to not default
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', currentUser.id);
                
            // Then set selected address as default
            const { error } = await supabase
                .from('addresses')
                .update({ is_default: true })
                .eq('id', addressId);
                
            if (error) throw error;
            
            // Reload addresses
            loadUserAddresses();
            showNotification('Default address updated successfully', 'notification-success');
        } catch (error) {
            console.error('Error setting default address:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Edit address - open modal and populate with address data
    async function editAddress(addressId) {
        if (!currentUser || !addressId) return;
        
        try {
            // Get address data
            const { data: address, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('id', addressId)
                .single();
                
            if (error) throw error;
            
            if (address) {
                // Populate form fields
                document.getElementById('address-id').value = address.id;
                document.getElementById('street').value = address.street_address;
                document.getElementById('city').value = address.city;
                document.getElementById('state').value = address.state;
                document.getElementById('postal').value = address.postal_code;
                document.getElementById('country').value = address.country;
                document.getElementById('is-default').checked = address.is_default;
                
                // Update modal title and show
                addressModalTitle.textContent = 'Edit Address';
                addressModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading address for edit:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Add new address - open modal with empty form
    function addNewAddress() {
        // Reset form fields
        document.getElementById('address-id').value = '';
        document.getElementById('street').value = '';
        document.getElementById('city').value = '';
        document.getElementById('state').value = '';
        document.getElementById('postal').value = '';
        document.getElementById('country').value = '';
        document.getElementById('is-default').checked = false;
        
        // Update modal title and show
        addressModalTitle.textContent = 'Add New Address';
        addressModal.style.display = 'block';
    }
    
    // Save address (add new or update existing)
    async function saveAddress(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        // Get form data
        const addressId = document.getElementById('address-id').value;
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const postal = document.getElementById('postal').value;
        const country = document.getElementById('country').value;
        const isDefault = document.getElementById('is-default').checked;
        
        // Validate form
        if (!street || !city || !state || !postal || !country) {
            showNotification('Please fill in all address fields', 'notification-error');
            return;
        }
        
        try {
            // If isDefault is true, set all other addresses to not default
            if (isDefault) {
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', currentUser.id);
            }
            
            // Prepare address data
            const addressData = {
                street_address: street,
                city: city,
                state: state,
                postal_code: postal,
                country: country,
                is_default: isDefault
            };
            
            if (addressId) {
                // Update existing address
                const { error } = await supabase
                    .from('addresses')
                    .update(addressData)
                    .eq('id', addressId);
                    
                if (error) throw error;
                
                showNotification('Address updated successfully', 'notification-success');
            } else {
                // Add new address
                const { error } = await supabase
                    .from('addresses')
                    .insert({
                        ...addressData,
                        user_id: currentUser.id
                    });
                    
                if (error) throw error;
                
                showNotification('Address added successfully', 'notification-success');
            }
            
            // Hide modal and reload addresses
            addressModal.style.display = 'none';
            loadUserAddresses();
        } catch (error) {
            console.error('Error saving address:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Delete address
    async function deleteAddress(addressId) {
        if (!currentUser || !addressId) return;
        
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);
                
            if (error) throw error;
            
            // Hide modal and reload addresses
            deleteAddressModal.style.display = 'none';
            loadUserAddresses();
            showNotification('Address deleted successfully', 'notification-success');
        } catch (error) {
            console.error('Error deleting address:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Cancel order
    async function cancelOrder(orderId) {
        if (!currentUser || !orderId) return;
        
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', orderId);
                
            if (error) throw error;
            
            // Hide modal and reload orders
            cancelOrderModal.style.display = 'none';
            loadUserOrders();
            showNotification('Order cancelled successfully', 'notification-success');
        } catch (error) {
            console.error('Error cancelling order:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Update profile
    async function updateProfile(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        // Get form data
        const fullName = fullNameInput.value;
        const phone = phoneInput.value;
        const avatarUrl = avatarInput.value;
        
        // Validate form
        if (!fullName) {
            showNotification('Name is required', 'notification-error');
            return;
        }
        
        try {
            // Update user in database
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: fullName,
                    phone: phone,
                    avatar_url: avatarUrl
                })
                .eq('id', currentUser.id);
                
            if (error) throw error;
            
            // Update UI
            profileName.textContent = fullName;
            if (avatarUrl) {
                profileAvatar.src = avatarUrl;
            }
            
            showNotification('Profile updated successfully', 'notification-success');
        } catch (error) {
            console.error('Error updating profile:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Logout
    async function logout() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error signing out:', error.message);
            showNotification(error.message, 'notification-error');
        }
    }
    
    // Show notification
    function showNotification(message, type = 'notification-success') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Close modals when clicking outside the content
    window.addEventListener('click', (e) => {
        if (e.target === addressModal) {
            addressModal.style.display = 'none';
        } else if (e.target === deleteAddressModal) {
            deleteAddressModal.style.display = 'none';
        } else if (e.target === cancelOrderModal) {
            cancelOrderModal.style.display = 'none';
        }
    });
    
    // Event listeners
    profileForm.addEventListener('submit', updateProfile);
    addressForm.addEventListener('submit', saveAddress);
    logoutBtn.addEventListener('click', logout);
    addAddressBtn.addEventListener('click', addNewAddress);
    cancelAddressBtn.addEventListener('click', () => addressModal.style.display = 'none');
    confirmDeleteBtn.addEventListener('click', () => deleteAddress(deleteAddressId.value));
    cancelDeleteBtn.addEventListener('click', () => deleteAddressModal.style.display = 'none');
    confirmCancelOrderBtn.addEventListener('click', () => cancelOrder(cancelOrderId.value));
    cancelCancelOrderBtn.addEventListener('click', () => cancelOrderModal.style.display = 'none');
    
    // Initialize
    loadUserData();
}); 