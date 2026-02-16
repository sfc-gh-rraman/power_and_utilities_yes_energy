-- ============================================================================
-- POWER & UTILITIES INTELLIGENCE PLATFORM - Cortex Search Setup
-- ============================================================================
-- Sets up Cortex Search on RTO_INSIDER_DOCS for the Knowledge Base
-- ============================================================================

USE DATABASE POWER_UTILITIES_DB;
USE SCHEMA DOCS;

-- ============================================================================
-- DOCUMENT TABLE
-- ============================================================================

CREATE OR REPLACE TABLE RTO_NEWS_ARTICLES (
    DOC_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    SOURCE_ID NUMBER,
    TITLE VARCHAR(500) NOT NULL,
    CONTENT VARCHAR(16777216),
    EXCERPT VARCHAR(5000),
    PUBLISHED_DATE TIMESTAMP_NTZ,
    
    -- Metadata for search/filtering
    SOURCE VARCHAR(100) DEFAULT 'RTO_INSIDER',
    CATEGORIES ARRAY,
    ENTITIES ARRAY,
    REGIONS ARRAY,
    
    -- Search optimization
    CONTENT_EMBEDDING VECTOR(FLOAT, 1024),
    
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================================
-- LOAD ARTICLES FROM RTO_INSIDER_DOCS
-- ============================================================================

CREATE OR REPLACE PROCEDURE LOAD_RTO_ARTICLES()
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO RTO_NEWS_ARTICLES (SOURCE_ID, TITLE, CONTENT, EXCERPT, PUBLISHED_DATE, SOURCE)
    SELECT 
        ID AS SOURCE_ID,
        POSTTITLE AS TITLE,
        POSTCONTENT AS CONTENT,
        POSTEXCERPT AS EXCERPT,
        POSTDATE AS PUBLISHED_DATE,
        'RTO_INSIDER' AS SOURCE
    FROM RTO_INSIDER_DOCS.DRAFT_WORK.SAMPLE_RTO
    WHERE POSTTITLE IS NOT NULL;
    
    RETURN 'Loaded ' || (SELECT COUNT(*) FROM RTO_NEWS_ARTICLES) || ' articles';
END;
$$;

-- ============================================================================
-- CORTEX SEARCH SERVICE
-- ============================================================================

CREATE OR REPLACE CORTEX SEARCH SERVICE POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH
    ON CONTENT
    ATTRIBUTES TITLE, EXCERPT, PUBLISHED_DATE, SOURCE
    WAREHOUSE = POWER_UTILITIES_WH
    TARGET_LAG = '1 hour'
AS (
    SELECT 
        DOC_ID,
        TITLE,
        CONTENT,
        EXCERPT,
        PUBLISHED_DATE,
        SOURCE
    FROM POWER_UTILITIES_DB.DOCS.RTO_NEWS_ARTICLES
);

-- ============================================================================
-- ADDITIONAL DOCUMENT TABLES FOR INTERNAL KNOWLEDGE
-- ============================================================================

CREATE OR REPLACE TABLE ERCOT_MARKET_RULES (
    DOC_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    RULE_NAME VARCHAR(500) NOT NULL,
    RULE_CATEGORY VARCHAR(100),
    CONTENT VARCHAR(16777216),
    EFFECTIVE_DATE DATE,
    VERSION VARCHAR(20),
    SOURCE_URL VARCHAR(1000),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE ANALYSIS_REPORTS (
    REPORT_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    REPORT_TYPE VARCHAR(100),
    REPORT_DATE DATE,
    ZONE_CODE VARCHAR(50),
    TITLE VARCHAR(500),
    SUMMARY VARCHAR(5000),
    CONTENT VARCHAR(16777216),
    KEY_FINDINGS ARRAY,
    GENERATED_BY VARCHAR(100),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================================
-- UNIFIED SEARCH VIEW
-- ============================================================================

CREATE OR REPLACE VIEW V_ALL_DOCUMENTS AS
SELECT 
    'NEWS' AS DOC_TYPE,
    DOC_ID::VARCHAR AS DOC_ID,
    TITLE,
    EXCERPT AS SUMMARY,
    CONTENT,
    PUBLISHED_DATE AS DOC_DATE,
    SOURCE
FROM RTO_NEWS_ARTICLES

UNION ALL

SELECT 
    'RULE' AS DOC_TYPE,
    DOC_ID::VARCHAR AS DOC_ID,
    RULE_NAME AS TITLE,
    RULE_CATEGORY AS SUMMARY,
    CONTENT,
    EFFECTIVE_DATE AS DOC_DATE,
    'ERCOT' AS SOURCE
FROM ERCOT_MARKET_RULES

UNION ALL

SELECT 
    'REPORT' AS DOC_TYPE,
    REPORT_ID::VARCHAR AS DOC_ID,
    TITLE,
    SUMMARY,
    CONTENT,
    REPORT_DATE AS DOC_DATE,
    GENERATED_BY AS SOURCE
FROM ANALYSIS_REPORTS;
