-- =====================================================
-- VOLT Power & Utilities - Cortex Agent Deployment
-- =====================================================
-- 
-- IMPORTANT: Cortex Agents are deployed via the Snowsight UI or Python API.
-- This SQL file provides setup and verification steps.
--
-- To deploy the agent:
-- 1. Go to Snowsight → AI & ML → Cortex Agents
-- 2. Click "Create Agent"
-- 3. Configure with the settings from volt_agent.json
-- 4. Or use the Python utility script below
-- =====================================================

USE DATABASE POWER_UTILITIES_DB;
USE SCHEMA ML;
USE WAREHOUSE POWER_UTILITIES_WH;

-- =====================================================
-- Stage Setup for Semantic Model
-- =====================================================

CREATE STAGE IF NOT EXISTS SEMANTIC_MODELS
    DIRECTORY = (ENABLE = TRUE)
    COMMENT = 'Stage for semantic model YAML files';

-- Upload semantic model (run from local machine):
-- PUT file://power_utilities_semantic_model.yaml @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

-- =====================================================
-- Prerequisites Check
-- =====================================================

SELECT '🔍 Step 1: Checking semantic model stage...' as STEP;
LIST @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS;

SELECT '🔍 Step 2: Checking Cortex Search services...' as STEP;
SHOW CORTEX SEARCH SERVICES IN DATABASE POWER_UTILITIES_DB;

SELECT '🔍 Step 3: Verifying data exists...' as STEP;
SELECT 
    (SELECT COUNT(*) FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS) as dart_load_records,
    (SELECT COUNT(DISTINCT OBJECTID) FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS) as unique_zones;

-- =====================================================
-- Agent Configuration Summary (for UI deployment)
-- =====================================================

/*
Agent Name: VOLT_POWER_AGENT

Description: 
AI agent for ERCOT power market intelligence. Combines load analytics, 
price forecasting, weather impact analysis, and 4CP peak prediction.

Model: mistral-large (or llama3.1-70b)

Tools:
1. data_analyst (Cortex Analyst)
   - Semantic Model: @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/power_utilities_semantic_model.yaml
   - Description: Query ERCOT power market data

2. news_search (Cortex Search)
   - Service: DOCS.RTO_NEWS_SEARCH
   - Description: Search RTO Insider news articles

3. rules_search (Cortex Search)
   - Service: DOCS.ERCOT_RULES_SEARCH
   - Description: Search ERCOT market rules

Sample Questions:
- What is the current load across ERCOT zones?
- Show me today's price forecast vs actuals
- What is the 4CP probability for this hour?
- What is the Hidden Discovery pattern?
- Search for news about ERCOT market changes
*/

-- =====================================================
-- Python Deployment Script
-- =====================================================
-- 
-- Save this as deploy_agent.py and run with snowpark session:
--
-- ```python
-- from snowflake.core import Root
-- from snowflake.core.cortex.agent import CortexAgent, CortexAgentTool
-- 
-- def deploy_volt_agent(session):
--     """Deploy VOLT Power Agent to Cortex."""
--     
--     agent = CortexAgent(
--         name="VOLT_POWER_AGENT",
--         description="AI agent for ERCOT power market intelligence with 4CP prediction capabilities",
--         model="mistral-large",
--         instructions="""You are VOLT, an AI assistant for power and utilities market intelligence.
-- You help energy traders, grid operators, and analysts understand load patterns, price dynamics, and transmission cost exposure.
-- 
-- IMPORTANT: For 'Hidden Discovery' questions, analyze 4CP peak hour patterns - 
-- the 4 summer coincident peaks determine $2.8M+ in annual transmission costs!
-- 
-- Always provide context about ERCOT market-wide impacts, not just individual zones.
-- Format power in MW with commas. Highlight risks when 4CP probability exceeds 60%.""",
--         tools=[
--             CortexAgentTool(
--                 tool_type="cortex_analyst_text_to_sql",
--                 name="data_analyst",
--                 spec={
--                     "semantic_model": "@POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/power_utilities_semantic_model.yaml",
--                     "description": "Query ERCOT power market data including load, prices, weather, and ML predictions"
--                 }
--             ),
--             CortexAgentTool(
--                 tool_type="cortex_search",
--                 name="news_search",
--                 spec={
--                     "service": "POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH",
--                     "max_results": 10,
--                     "description": "Semantic search on RTO Insider news articles"
--                 }
--             ),
--             CortexAgentTool(
--                 tool_type="cortex_search",
--                 name="rules_search",
--                 spec={
--                     "service": "POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH",
--                     "max_results": 5,
--                     "description": "Search ERCOT market rules and protocols"
--                 }
--             )
--         ]
--     )
--     
--     root = Root(session)
--     agents = root.databases["POWER_UTILITIES_DB"].schemas["ML"].cortex_agents
--     agents.create(agent, mode="or_replace")
--     
--     print("✅ VOLT_POWER_AGENT deployed successfully!")
--     return agent
-- 
-- # Usage:
-- # from snowflake.snowpark import Session
-- # session = Session.builder.configs({"connection_name": "my_snowflake"}).create()
-- # deploy_volt_agent(session)
-- ```

-- =====================================================
-- Test Queries (run after agent is deployed)
-- =====================================================

-- Test load data from Yes Energy
SELECT 
    OBJECTID as ZONE,
    DATETIME,
    RTLOAD as REAL_TIME_LOAD_MW,
    DALOAD as DAY_AHEAD_LOAD_MW
FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS
WHERE DATETIME >= DATEADD('hour', -24, CURRENT_TIMESTAMP())
ORDER BY DATETIME DESC
LIMIT 20;

-- Test News Search (uncomment after service is created)
-- SELECT * FROM TABLE(
--     POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH(
--         QUERY => 'ERCOT 4CP transmission cost',
--         LIMIT => 10
--     )
-- );

-- =====================================================
-- Verification
-- =====================================================

SELECT '✅ Agent configuration ready!' as STATUS;
SELECT 'To deploy: Snowsight → AI & ML → Cortex Agents → Create Agent' as INSTRUCTIONS;
SELECT 'Or run the Python script above with a Snowpark session' as ALTERNATIVE;

-- Show 4CP pattern preview (the "wow" moment)
SELECT 
    '🔍 4CP DISCOVERY PREVIEW' as SECTION,
    'Peak Load Hours - Potential 4CP Events' as PATTERN,
    COUNT(*) as HIGH_LOAD_HOURS,
    ROUND(AVG(RTLOAD), 0) as AVG_LOAD_MW,
    ROUND(MAX(RTLOAD), 0) as PEAK_LOAD_MW
FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS
WHERE EXTRACT(MONTH FROM DATETIME) BETWEEN 6 AND 9  -- Summer months
  AND EXTRACT(HOUR FROM DATETIME) BETWEEN 14 AND 18  -- Peak hours
  AND RTLOAD > 50000;  -- High load threshold
