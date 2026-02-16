# VOLT Power & Utilities - Cortex AI Integration

This folder contains all Snowflake Cortex AI components for the VOLT platform.

## Components

### 1. Cortex Agent (`volt_agent.json`, `deploy_agent.sql`, `deploy_agent.py`)

The VOLT Power Agent is an AI assistant for ERCOT power market intelligence.

**Capabilities:**
- Natural language queries on load, price, and weather data
- 4CP probability prediction and alerts
- RTO Insider news search
- ERCOT rules and protocol lookup

**Tools:**
- `data_analyst` - Cortex Analyst (text-to-SQL on semantic model)
- `news_search` - Cortex Search on RTO Insider articles
- `rules_search` - Cortex Search on ERCOT market rules

### 2. Semantic Model (`power_utilities_semantic_model.yaml`)

Defines the data model for Cortex Analyst text-to-SQL:

**Tables:**
- `dart_loads` - Real-time and day-ahead load data from Yes Energy
- `load_zones` - ERCOT zone reference data
- `prices` - Locational Marginal Prices (LMP)
- `weather` - Hourly weather observations
- `four_cp_predictions` - ML predictions for 4CP probability

**Verified Queries:**
- Current load by zone
- Total ERCOT system load
- Summer peak hour analysis
- 4CP probability lookup
- Hidden Discovery pattern

### 3. Cortex Search Services (`deploy_search.sql`)

Search services for document retrieval:

- `RTO_NEWS_SEARCH` - RTO Insider news articles
- `ERCOT_RULES_SEARCH` - ERCOT market rules and protocols
- `FOUR_CP_ANALYSIS_SEARCH` - 4CP analysis documents

### 4. ML Tables (`deploy_ml_tables.sql`)

Tables for ML model predictions:

- `FOUR_CP_PREDICTIONS` - Hourly 4CP probability predictions
- `MODEL_REGISTRY` - ML model metadata and performance metrics

## Deployment Order

1. **Database Setup** (if not already done)
   ```sql
   -- Run from ddl/001_database.sql
   ```

2. **ML Tables**
   ```sql
   -- Run cortex/deploy_ml_tables.sql
   ```

3. **Search Services**
   ```sql
   -- Run cortex/deploy_search.sql
   ```

4. **Upload Semantic Model**
   ```bash
   snow stage copy cortex/power_utilities_semantic_model.yaml @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS
   ```

5. **Deploy Agent (via Snowsight UI)**
   - Go to AI & ML → Cortex Agents
   - Click "Create Agent"
   - Use settings from `volt_agent.json`

## Hidden Discovery Pattern

The "Hidden Discovery" for Power & Utilities is **4CP Transmission Cost Exposure**:

- ERCOT allocates transmission costs based on 4 summer coincident peaks
- Missing even ONE 4CP event costs ~$2.8M annually
- The pattern shows clustering of high-probability hours in summer afternoons
- Our ML model provides 4-hour advance warning with 87% accuracy

**Sample Questions:**
- "What is the Hidden Discovery pattern?"
- "Show me 4CP probability for this hour"
- "What are the summer peak hours?"
- "Search for 4CP transmission cost rules"

## Testing

After deployment, test with these queries:

```sql
-- Test semantic model data access
SELECT * FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS LIMIT 5;

-- Test 4CP predictions
SELECT * FROM POWER_UTILITIES_DB.ML.FOUR_CP_PREDICTIONS 
ORDER BY PREDICTION_DATETIME DESC LIMIT 5;

-- Test search service
SELECT * FROM TABLE(
    POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH(
        QUERY => '4CP transmission cost',
        LIMIT => 3
    )
);
```

## Integration with App

The backend agents in `/backend/agents/` use these Cortex services:

- `orchestrator.py` - Routes queries to appropriate agents
- `load_agent.py` - Uses semantic model for load queries
- `search_agent.py` - Uses Cortex Search for document retrieval

The frontend `/frontend/src/pages/KnowledgeBase.tsx` provides the chat interface.
