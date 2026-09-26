-- FoodBridge Database Schema
-- Run this SQL script in phpMyAdmin or MySQL command line after creating the database

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS foodbridge;
USE foodbridge;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role ENUM('donor', 'partner', 'beneficiary', 'admin') NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  profileImage VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donorId INT NOT NULL,
  donorName VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('cooked', 'packaged', 'raw') NOT NULL,
  quantity INT NOT NULL,
  expiryDate DATE NOT NULL,
  pickupLocation TEXT NOT NULL,
  images JSON,
  status ENUM('pending', 'review', 'approved', 'rejected', 'in_transit', 'delivered') DEFAULT 'pending',
  aiAssessment JSON,
  assignedBeneficiary INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (donorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignedBeneficiary) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donor (donorId),
  INDEX idx_status (status),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('partner', 'beneficiary') NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  documents JSON,
  userId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
INSERT INTO users (email, name, role, phone, address, verified) VALUES
('admin@foodbridge.com', 'Admin User', 'admin', NULL, NULL, TRUE),
('donor@example.com', 'John Donor', 'donor', '+1234567890', '123 Main St, City', TRUE),
('ngo@helping.org', 'Helping Hands NGO', 'beneficiary', '+1987654321', '456 Oak Ave, City', TRUE),
('partner@restaurant.com', 'Fresh Food Restaurant', 'partner', '+1555123456', '789 Restaurant Blvd, City', TRUE),
('partner2@restaurant.com', 'Green Valley Catering', 'partner', '+1555987654', '22 Valley Rd, City', TRUE),
('ngo2@helping.org', 'Helping Hands NGO 2', 'beneficiary', '+1987012345', '88 Pine Street, City', TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Seed Organizations (partner + beneficiary)
-- Note: This script is meant for local development/testing.
DELETE FROM organizations
WHERE email IN ('partner@restaurant.com','partner2@restaurant.com','ngo@helping.org','ngo2@helping.org');

INSERT INTO organizations (name, type, email, phone, address, description, verified, documents, userId)
SELECT
  u.name,
  'partner',
  u.email,
  u.phone,
  u.address,
  'Sample partner organization for testing',
  TRUE,
  JSON_ARRAY('sample-document.pdf'),
  u.id
FROM users u
WHERE u.email IN ('partner@restaurant.com','partner2@restaurant.com');

INSERT INTO organizations (name, type, email, phone, address, description, verified, documents, userId)
SELECT
  u.name,
  'beneficiary',
  u.email,
  u.phone,
  u.address,
  'Sample beneficiary organization for testing',
  TRUE,
  JSON_ARRAY('sample-document.pdf'),
  u.id
FROM users u
WHERE u.email IN ('ngo@helping.org','ngo2@helping.org');

-- Seed Donations (5 rows)
DELETE FROM donations
WHERE title IN (
  'Canned Food Pack - April',
  'Fresh Produce Box',
  'Cooked Meal Bundle',
  'Emergency Food Delivery',
  'Community Lunch Supplies'
);

INSERT INTO donations
  (donorId, donorName, title, description, category, quantity, expiryDate, pickupLocation, images, status, aiAssessment, assignedBeneficiary)
VALUES
  (
    (SELECT id FROM users WHERE email = 'donor@example.com' LIMIT 1),
    (SELECT name FROM users WHERE email = 'donor@example.com' LIMIT 1),
    'Canned Food Pack - April',
    'Assorted canned food packs for families.',
    'packaged',
    25,
    '2026-04-15',
    'Pickup Point A, Downtown',
    JSON_ARRAY('https://example.com/images/canned-food-pack.jpg'),
    'pending',
    NULL,
    NULL
  ),
  (
    (SELECT id FROM users WHERE email = 'donor@example.com' LIMIT 1),
    (SELECT name FROM users WHERE email = 'donor@example.com' LIMIT 1),
    'Fresh Produce Box',
    'Assorted fresh vegetables and fruits.',
    'raw',
    18,
    '2026-04-18',
    'Pickup Point B, Market Street',
    JSON_ARRAY('https://example.com/images/produce-box.jpg'),
    'review',
    JSON_OBJECT('qualityScore', 8, 'freshness', 'good', 'safetyRating', 9, 'expiryExtracted', '2026-04-18', 'recommendations', JSON_ARRAY('keep refrigerated'), 'approved', FALSE),
    NULL
  ),
  (
    (SELECT id FROM users WHERE email = 'donor@example.com' LIMIT 1),
    (SELECT name FROM users WHERE email = 'donor@example.com' LIMIT 1),
    'Cooked Meal Bundle',
    'Prepared cooked meals for community distribution.',
    'cooked',
    30,
    '2026-04-20',
    'Pickup Point C, Community Center',
    JSON_ARRAY('https://example.com/images/cooked-meal-bundle.jpg'),
    'approved',
    NULL,
    NULL
  ),
  (
    (SELECT id FROM users WHERE email = 'donor@example.com' LIMIT 1),
    (SELECT name FROM users WHERE email = 'donor@example.com' LIMIT 1),
    'Emergency Food Delivery',
    'Emergency supply of essentials for immediate support.',
    'packaged',
    12,
    '2026-04-10',
    'Pickup Point D, Health Clinic',
    JSON_ARRAY('https://example.com/images/emergency-food.jpg'),
    'in_transit',
    NULL,
    (SELECT id FROM users WHERE email = 'ngo@helping.org' LIMIT 1)
  ),
  (
    (SELECT id FROM users WHERE email = 'donor@example.com' LIMIT 1),
    (SELECT name FROM users WHERE email = 'donor@example.com' LIMIT 1),
    'Community Lunch Supplies',
    'Lunch supplies for community outreach.',
    'cooked',
    40,
    '2026-04-25',
    'Pickup Point E, School Grounds',
    JSON_ARRAY('https://example.com/images/community-lunch.jpg'),
    'delivered',
    NULL,
    (SELECT id FROM users WHERE email = 'ngo2@helping.org' LIMIT 1)
  );
