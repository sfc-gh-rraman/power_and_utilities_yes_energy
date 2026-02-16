-- ============================================================================
-- VOLT Power & Utilities - Enhanced Cortex Search Services
-- ============================================================================
-- Extends the base search services with ERCOT rules and market analysis
-- ============================================================================

USE DATABASE POWER_UTILITIES_DB;
USE SCHEMA DOCS;
USE WAREHOUSE POWER_UTILITIES_WH;

-- ============================================================================
-- ERCOT MARKET RULES SEARCH SERVICE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ERCOT_MARKET_RULES (
    DOC_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    RULE_NAME VARCHAR(500) NOT NULL,
    RULE_CATEGORY VARCHAR(100),
    CONTENT TEXT,
    EFFECTIVE_DATE DATE,
    VERSION VARCHAR(20),
    SOURCE_URL VARCHAR(1000),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Insert sample ERCOT rules content
INSERT INTO ERCOT_MARKET_RULES (RULE_NAME, RULE_CATEGORY, CONTENT, EFFECTIVE_DATE, VERSION)
SELECT * FROM (
    SELECT 
        'Four Coincident Peak (4CP) Methodology' as RULE_NAME,
        '4CP' as RULE_CATEGORY,
        'The Four Coincident Peak (4CP) methodology allocates transmission costs based on load during the four highest 15-minute system peak intervals in June through September. Each Transmission Service Provider (TSP) bills load-serving entities based on their contribution to system peak during these intervals. The ERCOT ISO determines the 4CP intervals after the summer season ends. Load-serving entities can reduce their 4CP allocation by implementing demand response programs during predicted peak hours.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
    UNION ALL
    SELECT
        '4CP Settlement Process' as RULE_NAME,
        '4CP' as RULE_CATEGORY,
        'ERCOT settles 4CP charges based on metered interval data from the four highest system peaks. TSPs submit their 4CP billing factors to ERCOT by October 15 each year. Load-serving entities receive their 4CP share based on their metered load during the coincident peak intervals. Disputes must be filed within 60 days of receiving settlement statements.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
    UNION ALL
    SELECT
        'Real-Time Market Operations' as RULE_NAME,
        'MARKET_OPERATIONS' as RULE_CATEGORY,
        'The ERCOT real-time market operates on a 5-minute interval basis. Security Constrained Economic Dispatch (SCED) clears the market every 5 minutes, determining Locational Marginal Prices (LMPs) and dispatch instructions. Market participants submit offers and bids that remain in effect until updated. System-wide offer caps apply during scarcity conditions.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
    UNION ALL
    SELECT
        'Day-Ahead Market Settlement' as RULE_NAME,
        'MARKET_OPERATIONS' as RULE_CATEGORY,
        'The Day-Ahead Market (DAM) clears daily at 1300 Central Time for the next operating day. Market participants submit three-part offers including startup, minimum energy, and incremental energy components. DAM awards are financially binding, with deviations settled in the real-time market at real-time LMPs.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
    UNION ALL
    SELECT
        'Demand Response Programs' as RULE_NAME,
        'DEMAND_RESPONSE' as RULE_CATEGORY,
        'ERCOT supports several demand response programs including Emergency Response Service (ERS), Load Resources participating in SCED, and voluntary conservation programs. Load resources can provide Responsive Reserve and Non-Spinning Reserve services. ERS is dispatched when operating reserves fall below threshold levels.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
    UNION ALL
    SELECT
        'Transmission Cost Allocation' as RULE_NAME,
        '4CP' as RULE_CATEGORY,
        'Transmission costs in ERCOT are allocated through multiple mechanisms. Regional transmission costs are allocated based on 4CP methodology. Point-of-delivery charges apply to specific delivery points. Transmission congestion costs are socialized through congestion revenue rights (CRRs) and uplift charges.' as CONTENT,
        '2024-01-01' as EFFECTIVE_DATE,
        '1.0' as VERSION
) source
WHERE NOT EXISTS (SELECT 1 FROM ERCOT_MARKET_RULES WHERE RULE_NAME = source.RULE_NAME);

-- Create Cortex Search Service for ERCOT Rules
CREATE OR REPLACE CORTEX SEARCH SERVICE POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH
    ON CONTENT
    ATTRIBUTES RULE_NAME, RULE_CATEGORY, EFFECTIVE_DATE
    WAREHOUSE = POWER_UTILITIES_WH
    TARGET_LAG = '1 hour'
AS (
    SELECT 
        DOC_ID,
        RULE_NAME,
        RULE_CATEGORY,
        CONTENT,
        EFFECTIVE_DATE,
        VERSION
    FROM POWER_UTILITIES_DB.DOCS.ERCOT_MARKET_RULES
);

COMMENT ON CORTEX SEARCH SERVICE ERCOT_RULES_SEARCH IS 
'Semantic search on ERCOT market rules and protocols';

-- ============================================================================
-- MARKET ANALYSIS REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS MARKET_ANALYSIS_REPORTS (
    REPORT_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    REPORT_TYPE VARCHAR(100),
    REPORT_DATE DATE,
    ZONE_CODE VARCHAR(50),
    TITLE VARCHAR(500),
    SUMMARY VARCHAR(5000),
    CONTENT TEXT,
    KEY_FINDINGS ARRAY,
    GENERATED_BY VARCHAR(100) DEFAULT 'VOLT_ANALYTICS',
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================================
-- 4CP ANALYSIS DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS FOUR_CP_ANALYSIS (
    DOC_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    ANALYSIS_TYPE VARCHAR(100),
    ANALYSIS_DATE DATE,
    CONTENT TEXT,
    PEAK_LOAD_MW NUMBER,
    ESTIMATED_COST_IMPACT NUMBER,
    RECOMMENDATIONS TEXT,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Insert sample 4CP analysis content
INSERT INTO FOUR_CP_ANALYSIS (ANALYSIS_TYPE, ANALYSIS_DATE, CONTENT, PEAK_LOAD_MW, ESTIMATED_COST_IMPACT, RECOMMENDATIONS)
SELECT * FROM (
    SELECT
        'HIDDEN_DISCOVERY' as ANALYSIS_TYPE,
        CURRENT_DATE() as ANALYSIS_DATE,
        'The Hidden Discovery pattern reveals that transmission cost exposure concentrates in a small number of summer afternoon hours. Analysis of historical 4CP intervals shows that 80% of transmission cost allocation occurs during just 4 hours per year. By implementing targeted demand response during high-probability 4CP windows, utilities can achieve 15-25% reduction in transmission cost allocation with minimal operational impact.' as CONTENT,
        68000 as PEAK_LOAD_MW,
        2800000 as ESTIMATED_COST_IMPACT,
        '1. Deploy real-time 4CP probability monitoring with 4-hour advance warning. 2. Pre-position demand response resources during June-September afternoon hours. 3. Implement automated load shedding triggers when probability exceeds 70%. 4. Review historical 4CP intervals to identify high-risk customer loads.' as RECOMMENDATIONS
) source
WHERE NOT EXISTS (SELECT 1 FROM FOUR_CP_ANALYSIS WHERE ANALYSIS_TYPE = 'HIDDEN_DISCOVERY');

-- Create Cortex Search Service for 4CP Analysis
CREATE OR REPLACE CORTEX SEARCH SERVICE POWER_UTILITIES_DB.DOCS.FOUR_CP_ANALYSIS_SEARCH
    ON CONTENT
    ATTRIBUTES ANALYSIS_TYPE, ANALYSIS_DATE, ESTIMATED_COST_IMPACT
    WAREHOUSE = POWER_UTILITIES_WH
    TARGET_LAG = '1 hour'
AS (
    SELECT 
        DOC_ID,
        ANALYSIS_TYPE,
        ANALYSIS_DATE,
        CONTENT,
        PEAK_LOAD_MW,
        ESTIMATED_COST_IMPACT,
        RECOMMENDATIONS
    FROM POWER_UTILITIES_DB.DOCS.FOUR_CP_ANALYSIS
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON ALL TABLES IN SCHEMA DOCS TO ROLE SYSADMIN;
GRANT USAGE ON CORTEX SEARCH SERVICE RTO_NEWS_SEARCH TO ROLE SYSADMIN;
GRANT USAGE ON CORTEX SEARCH SERVICE ERCOT_RULES_SEARCH TO ROLE SYSADMIN;
GRANT USAGE ON CORTEX SEARCH SERVICE FOUR_CP_ANALYSIS_SEARCH TO ROLE SYSADMIN;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '✅ Search services configured!' as STATUS;

-- List all search services
SHOW CORTEX SEARCH SERVICES IN SCHEMA POWER_UTILITIES_DB.DOCS;

-- Test ERCOT Rules Search
-- SELECT * FROM TABLE(
--     POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH(
--         QUERY => 'four coincident peak transmission cost allocation',
--         LIMIT => 5
--     )
-- );

-- Test 4CP Analysis Search
-- SELECT * FROM TABLE(
--     POWER_UTILITIES_DB.DOCS.FOUR_CP_ANALYSIS_SEARCH(
--         QUERY => 'hidden discovery pattern demand response',
--         LIMIT => 5
--     )
-- );
