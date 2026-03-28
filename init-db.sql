-- Create multiple databases required by microservices
CREATE DATABASE asms_auth;
CREATE DATABASE asms_academic;
CREATE DATABASE asms_productivity;
CREATE DATABASE asms_analytics;

-- Optional: Grant permissions if using non-default users
-- GRANT ALL PRIVILEGES ON DATABASE asms_academic TO postgres;