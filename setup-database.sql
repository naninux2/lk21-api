-- Run this in your PostgreSQL command line or GUI tool (like pgAdmin)
-- Make sure PostgreSQL is running first

-- Create the database
CREATE DATABASE lk21_api;

-- Optional: Create a dedicated user (if you want)
-- CREATE USER lk21_user WITH PASSWORD 'your_password';
-- GRANT ALL PRIVILEGES ON DATABASE lk21_api TO lk21_user;

-- Connect to the database to verify
\c lk21_api

-- Show current database
SELECT current_database();