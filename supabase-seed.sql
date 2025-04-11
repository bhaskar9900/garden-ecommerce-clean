-- Garden E-commerce Platform - Sample Data
-- This file contains SQL statements to populate the tables with initial data

-- Insert sample categories
INSERT INTO categories (id, name, description, image_url, slug, parent_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Indoor Plants', 'Beautiful plants for your home interior', 'images/categories/indoor-plants.jpg', 'indoor-plants', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Outdoor Plants', 'Hardy plants for your garden and landscape', 'images/categories/outdoor-plants.jpg', 'outdoor-plants', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Succulents', 'Low-maintenance plants for any space', 'images/categories/succulents.jpg', 'succulents', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Flowering Plants', 'Colorful blooming varieties', 'images/categories/flowering-plants.jpg', 'flowering-plants', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Shrubs', 'Ornamental woody plants for landscaping', 'images/categories/shrubs.jpg', 'shrubs', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Trees', 'Majestic trees for shade and beauty', 'images/categories/trees.jpg', 'trees', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Accessories', 'Plant care tools and decorative items', 'images/categories/accessories.jpg', 'accessories', NULL);

-- Insert sample products
INSERT INTO products (id, name, description, price, sale_price, sku, stock_quantity, slug, is_featured, is_active, category_id) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Monstera Deliciosa', 'The Swiss Cheese Plant is famous for its quirky natural leaf holes.', 29.99, NULL, 'PLANT-001', 50, 'monstera-deliciosa', true, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Fiddle Leaf Fig', 'Tall, sculptural plant with large, violin-shaped leaves.', 49.99, 44.99, 'PLANT-002', 35, 'fiddle-leaf-fig', true, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Snake Plant', 'Nearly indestructible plant with stiff, upright leaves.', 24.99, NULL, 'PLANT-003', 75, 'snake-plant', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Pothos', 'Trailing vine with heart-shaped leaves, perfect for beginners.', 19.99, NULL, 'PLANT-004', 60, 'pothos', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Hydrangea', 'Showy flowering shrub with large, rounded flower clusters.', 34.99, NULL, 'PLANT-005', 40, 'hydrangea', true, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Japanese Maple', 'Elegant tree with deeply lobed, red-purple leaves.', 89.99, NULL, 'PLANT-006', 20, 'japanese-maple', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Echeveria', 'Rosette-forming succulent with thick, fleshy leaves.', 14.99, 12.99, 'PLANT-007', 90, 'echeveria', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Watering Can', 'Stylish metal watering can with long spout.', 24.99, NULL, 'ACC-001', 45, 'watering-can', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Ceramic Pot - Medium', 'Minimalist ceramic pot in matte white finish.', 19.99, NULL, 'ACC-002', 60, 'ceramic-pot-medium', true, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Organic Soil Mix', 'Premium organic potting mix for indoor plants.', 12.99, NULL, 'ACC-003', 100, 'organic-soil-mix', false, true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17');

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'images/products/monstera-1.jpg', 'Monstera Deliciosa main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'images/products/monstera-2.jpg', 'Monstera Deliciosa leaf detail', false, 2),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'images/products/monstera-3.jpg', 'Monstera Deliciosa in room setting', false, 3),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'images/products/fiddle-leaf-1.jpg', 'Fiddle Leaf Fig main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'images/products/fiddle-leaf-2.jpg', 'Fiddle Leaf Fig in pot', false, 2),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'images/products/snake-plant-1.jpg', 'Snake Plant main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'images/products/pothos-1.jpg', 'Pothos main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'images/products/hydrangea-1.jpg', 'Hydrangea main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'images/products/japanese-maple-1.jpg', 'Japanese Maple main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'images/products/echeveria-1.jpg', 'Echeveria main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'images/products/watering-can-1.jpg', 'Watering Can main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'images/products/ceramic-pot-1.jpg', 'Ceramic Pot main view', true, 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'images/products/soil-mix-1.jpg', 'Organic Soil Mix main view', true, 1);

-- Insert sample product attributes
INSERT INTO product_attributes (id, name) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Light Level'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Watering Frequency'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Difficulty'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Size'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Material'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Color');

-- Insert sample product attribute values
INSERT INTO product_attribute_values (product_id, attribute_id, value) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Medium to Bright Indirect'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Weekly'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Intermediate'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Medium (12" pot)'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bright Indirect'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Weekly'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Challenging'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Large (14" pot)'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Low to Bright Indirect'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Monthly'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Beginner'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Ceramic'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'White'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Medium (8" diameter)');

-- Insert sample users
INSERT INTO users (id, email, full_name, phone, avatar_url) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'john.doe@example.com', 'John Doe', '555-123-4567', 'images/avatars/john.jpg'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'jane.smith@example.com', 'Jane Smith', '555-987-6543', 'images/avatars/jane.jpg'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'michael.johnson@example.com', 'Michael Johnson', '555-456-7890', NULL);

-- Insert sample addresses
INSERT INTO addresses (id, user_id, street_address, city, state, postal_code, country, is_default) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '123 Main St', 'Seattle', 'WA', '98101', 'United States', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '456 Oak Ave', 'Portland', 'OR', '97201', 'United States', true),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '789 Pine St', 'San Francisco', 'CA', '94105', 'United States', true);

-- Update users with address IDs
UPDATE users SET address_id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' WHERE id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
UPDATE users SET address_id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' WHERE id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
UPDATE users SET address_id = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' WHERE id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';

-- Insert sample coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, minimum_order_amount, starts_at, expires_at, is_active, usage_limit) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'WELCOME10', 'Get 10% off your first order', 'percentage', 10.00, 0.00, '2023-01-01', '2023-12-31', true, NULL),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'SUMMER25', 'Summer sale: 25% off', 'percentage', 25.00, 50.00, '2023-06-01', '2023-08-31', true, 500),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'FREE_SHIPPING', 'Free shipping on orders over $75', 'fixed', 8.99, 75.00, '2023-01-01', '2023-12-31', true, NULL);

-- Insert sample orders
INSERT INTO orders (id, user_id, status, total_amount, shipping_address_id, billing_address_id, payment_method, payment_status, shipping_method, shipping_price, tax_amount) VALUES
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'completed', 64.98, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'credit_card', 'paid', 'standard', 9.99, 5.00),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'processing', 99.98, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'paypal', 'paid', 'express', 14.99, 8.00),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'pending', 24.99, 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'credit_card', 'pending', 'standard', 9.99, 2.00);

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, price, total_price) VALUES
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 29.99, 29.99),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 1, 19.99, 19.99),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, 44.99, 44.99),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 1, 24.99, 24.99),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 1, 12.99, 12.99),
('g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, 24.99, 24.99);

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, review_text, is_verified_purchase, is_approved) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'Beautiful plant! Arrived in perfect condition and is thriving in my living room.', true, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 4, 'Gorgeous fiddle leaf fig. Took a week to adjust to my home but now growing well.', true, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 5, 'Perfect low-maintenance plant for my office. Highly recommend!', true, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'Simple and elegant pot. Great quality for the price.', true, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 3, 'Functional but smaller than I expected.', true, true);

-- Insert sample carts for active sessions
INSERT INTO carts (id, user_id, session_id) VALUES
('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sess_123456'),
('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'sess_789012');

-- Insert sample cart items
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 1),
('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 2),
('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1);

-- Insert sample wishlists
INSERT INTO wishlists (id, user_id, name, is_public) VALUES
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'My Plant Wishlist', true),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dream Garden', false);

-- Insert sample wishlist items
INSERT INTO wishlist_items (wishlist_id, product_id) VALUES
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18'); 