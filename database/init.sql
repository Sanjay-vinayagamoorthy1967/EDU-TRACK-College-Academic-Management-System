-- Initialize EduTrack Database
-- MySQL Database Setup Script

-- Create database
CREATE DATABASE IF NOT EXISTS edutrack;

-- Use database
USE edutrack;

-- Verify setup
SELECT 'Database initialized successfully!' AS status;
SELECT VERSION() AS mysql_version;
SELECT DATABASE() AS database_name;

-- Show character set
SHOW VARIABLES LIKE 'character_set%';
