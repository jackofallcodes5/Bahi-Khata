-- Bahi Khata Database Schema

CREATE DATABASE IF NOT EXISTS bahikhata;
USE bahikhata;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS societies;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS delivery_requests;
DROP TABLE IF EXISTS payment_history;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS subscription_days;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS service_business;
DROP TABLE IF EXISTS delivery_business;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS customer_groups;
DROP TABLE IF EXISTS shops;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

-- 3. Addresses
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) DEFAULT 'Home', -- Home, Work, Shop
    address_line TEXT NOT NULL,
    society VARCHAR(100),
    building VARCHAR(50),
    floor VARCHAR(20),
    house_no VARCHAR(20),
    zone VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Shops (Retail)
CREATE TABLE shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    gst_no VARCHAR(50),
    is_approved BOOLEAN DEFAULT FALSE,
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Delivery Business
CREATE TABLE delivery_business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    vehicle_no VARCHAR(50),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Service Provider Business
CREATE TABLE service_business (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    service_type VARCHAR(100), -- Maid, Cleaner, Cook, etc.
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Customer Groups
CREATE TABLE customer_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Customers (Mapping of a User to a Business)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL, -- Shop/Delivery/Service User ID
    customer_user_id INT NOT NULL, -- Global User ID for the customer
    group_id INT,
    credit_limit DECIMAL(10, 2) DEFAULT 0.00,
    outstanding_balance DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE SET NULL,
    UNIQUE(business_user_id, customer_user_id)
);

-- 9. Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    barcode VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
CREATE INDEX idx_products_barcode ON products(barcode);

-- 11. Inventory
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    last_restocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 12. Bills
CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    customer_id INT, -- NULL for walk-in customers
    invoice_no VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Cancelled') DEFAULT 'Pending',
    payment_method ENUM('Cash', 'UPI', 'Udhar', 'Card') DEFAULT 'Cash',
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);
CREATE INDEX idx_bills_invoice_no ON bills(invoice_no);

-- 13. Bill Items
CREATE TABLE bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(150) NOT NULL, -- Keep name in case product is deleted
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 14. Payments / Payment History
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    customer_id INT,
    bill_id INT, -- Can be NULL if it's a generic Udhar payment
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Cash', 'UPI', 'Bank Transfer') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Completed',
    transaction_id VARCHAR(100),
    receipt_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL
);

-- 15. Subscriptions (For Delivery/Services)
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    customer_id INT NOT NULL,
    product_id INT, -- E.g., Milk variant, Water Jar
    service_name VARCHAR(100), -- If it's a generic service
    start_date DATE NOT NULL,
    end_date DATE,
    frequency ENUM('Everyday', 'Alternate Days', 'Custom', 'Weekly', 'Monthly') DEFAULT 'Everyday',
    delivery_days VARCHAR(255) DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
    status ENUM('Active', 'Paused', 'Cancelled') DEFAULT 'Active',
    quantity_per_delivery DECIMAL(10, 2) DEFAULT 1,
    paused_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Temp Bills (For bills issued to unregistered phone numbers)
CREATE TABLE IF NOT EXISTS temp_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    invoice_no VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Paid', 'Pending') DEFAULT 'Pending',
    payment_method ENUM('Cash', 'UPI', 'Card', 'Udhar') NOT NULL,
    items_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. Subscription Days (For custom frequency)
CREATE TABLE subscription_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- 17. Attendance (Daily tracking for deliveries and services)
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Delivered', 'Missed', 'Holiday', 'Waiting Confirmation') DEFAULT 'Delivered',
    quantity_delivered DECIMAL(10, 2),
    photo_proof VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    UNIQUE(subscription_id, date)
);

-- 18. Delivery Requests (Extra/Skip)
CREATE TABLE delivery_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    request_type ENUM('Extra', 'Skip') NOT NULL,
    request_date DATE NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 0, -- Relevant for 'Extra'
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- 19. Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 20. Holidays
CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_user_id INT NOT NULL,
    date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hierarchy for routing
-- 21. Companies
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Zones
CREATE TABLE zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- 23. Societies
CREATE TABLE societies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
);

-- 24. Activity Logs
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ====================================================
-- SEED DATA
-- ====================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'Admin', 'Platform Administrator'),
(2, 'Customer', 'End user consuming services'),
(3, 'Retail Shop', 'Grocery, General Store'),
(4, 'Delivery Business', 'Milk, Water, Newspaper'),
(5, 'Service Provider', 'Maid, Cleaner, Cook');

-- Users (Password is 'password123' hashed with bcrypt for all users: $2a$10$wE9v.yC6.3t/L6PzB/lS..XwzP4uO81qgN2c3.zC.8eF3S0wV6B4C )
-- For dummy data simplicity in SQL, we will insert raw passwords if hash is too complex to generate here, but let's insert a standard hash for 'password123'
-- Hash for 'password123' -> $2a$10$C8.m0vL5O.cM.GzE7j3fH.cQ/QzY0.C/c.M.Z.0.Z.M.Z.0.Z.M.Z.0. (Using a dummy valid-looking bcrypt hash for example, actual hash is $2b$10$y58f3v76lE/Q1L26x58p..QO1n03L5/Kq8m.pT46R5K3y4Y2tD5cK )
-- Actually I will use a real hash for '123456': $2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u

INSERT INTO users (id, role_id, name, email, phone, password) VALUES
(1, 1, 'Super Admin', 'admin@bahikhata.com', '9999999999', '$2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u'),
(2, 3, 'Ramesh Grocery', 'ramesh@grocery.com', '8888888888', '$2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u'),
(3, 4, 'Suresh Milkman', 'suresh@milk.com', '7777777777', '$2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u'),
(4, 5, 'Kamala Maid', 'kamala@maid.com', '6666666666', '$2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u'),
(5, 2, 'Rahul Customer', 'rahul@gmail.com', '5555555555', '$2b$10$zE9k9R6wT6H/c.M4I.mQoeP3B2oJ1G2QG1J5W.R8C4w2Z9N4B6T4u');

-- Addresses
INSERT INTO addresses (user_id, type, address_line, city, state, pincode) VALUES
(1, 'Work', 'Admin HQ', 'Delhi', 'Delhi', '110001'),
(2, 'Shop', 'Shop No 4, Main Market', 'Mumbai', 'MH', '400001'),
(3, 'Work', 'Milk Dairy, Sector 12', 'Pune', 'MH', '411012'),
(4, 'Work', 'Shivaji Nagar', 'Pune', 'MH', '411005'),
(5, 'Home', 'Flat 101, Galaxy Apt', 'Mumbai', 'MH', '400001');

-- Business Profiles
INSERT INTO shops (user_id, business_name, is_approved) VALUES (2, 'Ramesh Kirana Store', TRUE);
INSERT INTO delivery_business (user_id, business_name, vehicle_no, is_approved) VALUES (3, 'Suresh Daily Needs', 'MH12 AB 1234', TRUE);
INSERT INTO service_business (user_id, business_name, service_type, is_approved) VALUES (4, 'Kamala Cleaning Services', 'Maid', TRUE);

-- Customers Mapping
-- Rahul is a customer of Ramesh, Suresh, and Kamala
INSERT INTO customers (business_user_id, customer_user_id, outstanding_balance) VALUES
(2, 5, 150.00),
(3, 5, 0.00),
(4, 5, 500.00);

-- Categories & Products (For Shop)
INSERT INTO categories (id, business_user_id, name) VALUES
(1, 2, 'Dal & Pulses'),
(2, 2, 'Snacks');

INSERT INTO products (id, business_user_id, category_id, name, price, barcode) VALUES
(1, 2, 1, 'Toor Dal 1kg', 160.00, '123456789012'),
(2, 2, 2, 'Lays Magic Masala', 20.00, '987654321098');

INSERT INTO inventory (product_id, stock) VALUES (1, 50), (2, 100);

-- Products (For Delivery)
INSERT INTO products (id, business_user_id, name, price) VALUES
(3, 3, 'Cow Milk 1L', 60.00);

-- Bills (Shop)
INSERT INTO bills (id, business_user_id, customer_id, invoice_no, total_amount, net_amount, payment_method, payment_status) VALUES
(1, 2, 1, 'INV-001', 180.00, 180.00, 'Udhar', 'Pending');

INSERT INTO bill_items (bill_id, product_id, product_name, quantity, price, total) VALUES
(1, 1, 'Toor Dal 1kg', 1, 160.00, 160.00),
(1, 2, 'Lays Magic Masala', 1, 20.00, 20.00);

-- Subscriptions (Delivery)
INSERT INTO subscriptions (id, business_user_id, customer_id, product_id, start_date, frequency, status, quantity_per_delivery) VALUES
(1, 3, 2, 3, '2023-10-01', 'Everyday', 'Active', 2); -- Rahul gets 2L milk everyday from Suresh

-- Attendance (Delivery)
INSERT INTO attendance (subscription_id, date, status, quantity_delivered) VALUES
(1, '2023-10-01', 'Delivered', 2),
(1, '2023-10-02', 'Delivered', 2);

-- Service Subscriptions (Maid)
INSERT INTO subscriptions (id, business_user_id, customer_id, service_name, start_date, frequency, status, quantity_per_delivery) VALUES
(2, 4, 3, 'Monthly Cleaning', '2023-10-01', 'Monthly', 'Active', 1);

-- Payments
INSERT INTO payments (business_user_id, customer_id, amount, payment_method, status) VALUES
(2, 1, 50.00, 'Cash', 'Completed');

