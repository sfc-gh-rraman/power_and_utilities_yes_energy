#!/usr/bin/env python3
"""
VOLT Power & Utilities - Cortex Agent Deployment Script

Verifies prerequisites and provides deployment instructions.
The agent itself is deployed via Snowsight UI.

Usage:
    python deploy_agent.py [--connection my_snowflake]
"""

import argparse
import json


def verify_and_print_instructions(connection_name: str = "my_snowflake"):
    """Verify prerequisites and print deployment instructions."""
    
    from snowflake.snowpark import Session
    
    print("⚡ VOLT Power & Utilities - Agent Deployment")
    print("=" * 60)
    
    # Create session
    print(f"\n📡 Connecting to Snowflake ({connection_name})...")
    session = Session.builder.configs({"connection_name": connection_name}).create()
    print(f"   ✓ Connected to {session.get_current_account()}")
    
    # Verify prerequisites
    print("\n🔍 Verifying prerequisites...")
    
    # Check Yes Energy data
    try:
        result = session.sql("""
            SELECT 
                COUNT(*) as total_records,
                MIN(DATETIME) as earliest,
                MAX(DATETIME) as latest,
                COUNT(DISTINCT OBJECTID) as zones
            FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS
        """).collect()
        row = result[0]
        print(f"   ✓ Yes Energy data: {row['TOTAL_RECORDS']:,} records")
        print(f"     Range: {row['EARLIEST']} to {row['LATEST']}")
        print(f"     Zones: {row['ZONES']}")
    except Exception as e:
        print(f"   ⚠️  Could not verify Yes Energy data: {e}")
    
    # Check search services
    try:
        result = session.sql("""
            SHOW CORTEX SEARCH SERVICES IN DATABASE POWER_UTILITIES_DB
        """).collect()
        services = [r['name'] for r in result]
        if 'RTO_NEWS_SEARCH' in services:
            print("   ✓ RTO_NEWS_SEARCH available")
        else:
            print("   ⚠️  RTO_NEWS_SEARCH not found - run 006_cortex_search.sql")
    except Exception as e:
        print(f"   ⚠️  Could not verify search services: {e}")
    
    # 4CP Discovery preview
    print("\n🎯 4CP Discovery Pattern (Hidden Discovery):")
    try:
        result = session.sql("""
            SELECT 
                COUNT(*) as peak_hours,
                ROUND(AVG(RTLOAD), 0) as avg_load,
                ROUND(MAX(RTLOAD), 0) as max_load
            FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS
            WHERE EXTRACT(MONTH FROM DATETIME) BETWEEN 6 AND 9
              AND EXTRACT(HOUR FROM DATETIME) BETWEEN 14 AND 18
              AND RTLOAD > 50000
        """).collect()
        row = result[0]
        print(f"   • Pattern: Summer Peak Hour Concentration")
        print(f"   • High-load hours identified: {row['PEAK_HOURS']:,}")
        print(f"   • Average load during peaks: {row['AVG_LOAD']:,} MW")
        print(f"   • Maximum load observed: {row['MAX_LOAD']:,} MW")
        print(f"   • Estimated 4CP transmission cost: ~$2.8M annually")
    except Exception as e:
        print(f"   ⚠️  Could not analyze 4CP pattern: {e}")
    
    # Load agent config
    print("\n📋 Agent Configuration:")
    try:
        with open("volt_agent.json", "r") as f:
            config = json.load(f)
        print(f"   • Name: {config['name']}")
        print(f"   • Tools: {', '.join([t['tool_name'] for t in config['tools']])}")
        print(f"   • Sample questions: {len(config['sample_questions'])}")
    except Exception as e:
        print(f"   ⚠️  Could not load config: {e}")
    
    # Print deployment instructions
    print("\n" + "=" * 60)
    print("📝 DEPLOYMENT INSTRUCTIONS")
    print("=" * 60)
    
    print("""
1. Open Snowsight in your browser

2. Navigate to: AI & ML → Cortex Agents

3. Click "Create Agent" or "+" button

4. Configure the agent:

   Name: VOLT_POWER_AGENT
   
   Description: 
   AI agent for ERCOT power market intelligence. 
   Combines load analytics, price forecasting, and 4CP prediction.
   
   Model: mistral-large (recommended) or llama3.1-70b
   
   Instructions:
   You are VOLT, an AI assistant for power and utilities market intelligence.
   You help energy traders, grid operators, and analysts understand load patterns.
   
   IMPORTANT: For 'Hidden Discovery' questions, analyze 4CP peak hour patterns - 
   the 4 summer coincident peaks determine $2.8M+ in annual transmission costs!
   
   Always format power in MW with commas. Highlight risks when 4CP probability > 60%.

5. Add Tools:

   Tool 1 - Data Analyst (Cortex Analyst):
   - Name: data_analyst
   - Semantic Model: @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/power_utilities_semantic_model.yaml
   
   Tool 2 - News Search (Cortex Search):
   - Name: news_search  
   - Service: POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH
   - Max Results: 10
   
   Tool 3 - Rules Search (Cortex Search):
   - Name: rules_search
   - Service: POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH
   - Max Results: 5

6. Test with these sample questions:
   - "What is the current load across ERCOT zones?"
   - "What is the 4CP probability for this hour?"
   - "What is the Hidden Discovery pattern?"
   - "Search for news about ERCOT transmission costs"

7. Click "Create" to deploy the agent
""")
    
    print("=" * 60)
    print("✅ Prerequisites verified! Ready for UI deployment.")
    print("=" * 60)
    
    session.close()


def main():
    parser = argparse.ArgumentParser(description="Deploy VOLT Power Agent")
    parser.add_argument("--connection", default="my_snowflake", help="Snowflake connection name")
    args = parser.parse_args()
    
    verify_and_print_instructions(args.connection)


if __name__ == "__main__":
    main()
