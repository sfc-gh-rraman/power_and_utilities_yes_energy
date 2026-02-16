-- ============================================================================
-- POWER & UTILITIES INTELLIGENCE PLATFORM - Database Setup
-- ============================================================================
-- Creates the database, schemas, and warehouse for the Power & Utilities app
-- Modeled after ATLAS (Construction Capital Delivery) architecture
-- ============================================================================

USE ROLE ACCOUNTADMIN;

-- Create dedicated warehouse for the app
CREATE WAREHOUSE IF NOT EXISTS POWER_UTILITIES_WH
    WAREHOUSE_SIZE = 'SMALL'
    AUTO_SUSPEND = 300
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE
    COMMENT = 'Warehouse for Power & Utilities Intelligence Platform';

-- Create the main database
CREATE DATABASE IF NOT EXISTS POWER_UTILITIES_DB
    COMMENT = 'Power & Utilities Intelligence Platform - ERCOT Market Analytics';

USE DATABASE POWER_UTILITIES_DB;

-- ============================================================================
-- SCHEMA ARCHITECTURE (following ATLAS pattern)
-- ============================================================================

-- RAW: Landing zone for external data ingestion
CREATE SCHEMA IF NOT EXISTS RAW
    COMMENT = 'Landing zone for raw data ingestion from YES_ENERGY and other sources';

-- ATOMIC: Normalized, cleansed entity tables
CREATE SCHEMA IF NOT EXISTS ATOMIC
    COMMENT = 'Normalized atomic tables - single source of truth for entities';

-- ANALYTICS: Aggregated views and datamarts for reporting
CREATE SCHEMA IF NOT EXISTS ANALYTICS
    COMMENT = 'Analytics views and datamarts for dashboards and reporting';

-- ML: Machine learning models, predictions, and artifacts
CREATE SCHEMA IF NOT EXISTS ML
    COMMENT = 'ML model artifacts, predictions, and feature stores';

-- DOCS: Document storage for Cortex Search
CREATE SCHEMA IF NOT EXISTS DOCS
    COMMENT = 'Document storage for Cortex Search knowledge base';

-- STAGING: Temporary staging area
CREATE SCHEMA IF NOT EXISTS STAGING
    COMMENT = 'Temporary staging area for data transformations';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON WAREHOUSE POWER_UTILITIES_WH TO ROLE SYSADMIN;
GRANT USAGE ON DATABASE POWER_UTILITIES_DB TO ROLE SYSADMIN;
GRANT USAGE ON ALL SCHEMAS IN DATABASE POWER_UTILITIES_DB TO ROLE SYSADMIN;
GRANT ALL PRIVILEGES ON ALL SCHEMAS IN DATABASE POWER_UTILITIES_DB TO ROLE SYSADMIN;

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

SHOW SCHEMAS IN DATABASE POWER_UTILITIES_DB;
