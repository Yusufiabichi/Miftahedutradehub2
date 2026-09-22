-- This is a SQL script that creates a database named `qvyddfwn_miftah_db` and sets up several tables for managing products, blogs, messages, service enquiries, and product inquiries. It also includes an admin user and some sample data for testing purposes.

CREATE DATABASE IF NOT EXISTS qvyddfwn_miftah_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qvyddfwn_miftah_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS product_inquiries;
DROP TABLE IF EXISTS service_enquiries;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS blog_tags;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image TEXT NULL,
  images JSON NULL,
  features JSON NULL,
  specifications JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blogs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  author VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT NOT NULL,
  read_time VARCHAR(50) NULL,
  status ENUM('Draft', 'Published', 'Archived') NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_tags (
  blog_id BIGINT UNSIGNED NOT NULL,
  tags TEXT NULL,
  PRIMARY KEY (blog_id),
  CONSTRAINT fk_blog_tags_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('unread', 'read', 'replied') NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_enquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service VARCHAR(255) NOT NULL,
  fullname VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(150) NULL,
  message TEXT NOT NULL,
  budget_range VARCHAR(100) NULL,
  expected_timeline VARCHAR(100) NULL,
  status ENUM('new', 'contacted', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(150) NULL,
  quantity INT NOT NULL DEFAULT 1,
  message TEXT NOT NULL,
  status ENUM('new', 'contacted', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_inquiries_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admin_users (email, password_hash, role, is_active)
VALUES ('yusufiabichi@yahoo.com', '$2b$12$JQHRflYumQ9Xacd/MTBTTObWCNme/GHsdIwXBymkcn/k/q0m4itf.', 'admin', 1)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  is_active = VALUES(is_active);

INSERT INTO products (name, category, description, image, images, features, specifications)
SELECT 'Sample Export Truck', 'Trucks', 'A sample product for local development and testing.', NULL, JSON_ARRAY(), JSON_ARRAY('Reliable performance', 'Export-ready documentation'), JSON_ARRAY('Condition: New', 'Availability: In stock')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sample Export Truck');

INSERT INTO blogs (title, excerpt, content, author, category, image, read_time, status)
SELECT 'Welcome to Miftah Edu-Trade Hub', 'A sample blog post for local development.', 'This is seed content for testing the blog management workflow.', 'Miftah Edu-Trade Hub', 'Company News', 'https://placehold.co/1200x630?text=Miftah+Blog', '3', 'Published'
WHERE NOT EXISTS (SELECT 1 FROM blogs WHERE title = 'Welcome to Miftah Edu-Trade Hub');

INSERT INTO blog_tags (blog_id, tags)
SELECT id, 'trade,education,travel'
FROM blogs
WHERE title = 'Welcome to Miftah Edu-Trade Hub'
  AND NOT EXISTS (SELECT 1 FROM blog_tags WHERE blog_tags.blog_id = blogs.id);

INSERT INTO messages (name, email, phone, subject, message)
SELECT 'Test Visitor', 'visitor@example.com', '+2348000000000', 'Local test message', 'This is sample contact data for local testing.'
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE subject = 'Local test message');

INSERT INTO service_enquiries (service, fullname, email, phone, company, message, budget_range, expected_timeline)
SELECT 'Import and Export Solutions', 'Test Customer', 'customer@example.com', '+2348111111111', 'Test Company', 'This is sample service enquiry data.', 'Under $5,000', 'Within 1 month'
WHERE NOT EXISTS (SELECT 1 FROM service_enquiries WHERE email = 'customer@example.com');

INSERT INTO product_inquiries (product_name, customer_name, email, phone, company, quantity, message)
SELECT 'Sample Export Truck', 'Test Buyer', 'buyer@example.com', '+2348222222222', 'Test Trading Co.', 1, 'This is sample product enquiry data.'
WHERE NOT EXISTS (SELECT 1 FROM product_inquiries WHERE email = 'buyer@example.com');

SET FOREIGN_KEY_CHECKS = 1;
