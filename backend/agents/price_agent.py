"""Price Analyst Agent - Specialized agent for price and congestion analysis."""

from typing import Optional

class PriceAnalystAgent:
    """Agent specialized in LMP analysis and price anomaly detection."""
    
    name = "Price Analyst Agent"
    description = "Analyzes electricity prices, congestion patterns, and price anomalies"
    
    def __init__(self, snow_conn):
        self.snow_conn = snow_conn
    
    async def process(self, query: str, context: Optional[str] = None) -> dict:
        """Process a price-related query."""
        cursor = self.snow_conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) AS ANOMALY_COUNT
            FROM POWER_UTILITIES_DB.ATOMIC.PRICE_ANOMALY_EVENT
            WHERE EVENT_START >= DATEADD('day', -7, CURRENT_DATE())
        """)
        anomaly_count = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT * FROM POWER_UTILITIES_DB.ML.HIDDEN_PATTERN
            WHERE STATUS != 'Template'
            LIMIT 3
        """)
        patterns = cursor.fetchall()
        
        answer = f"""**Price Analysis Summary:**

**Recent Activity:**
- Price anomaly events (last 7 days): {anomaly_count}

**Key Price Drivers in ERCOT:**
1. **Congestion**: Transmission constraints between zones affect LMPs
2. **Weather**: Temperature extremes drive demand and prices
3. **Natural Gas**: Fuel costs directly impact marginal generation costs

**Hidden Patterns Detected:**
"""
        if patterns:
            for p in patterns:
                answer += f"- {p[2]}: {p[3]}\n"
        else:
            answer += "- No active hidden patterns currently detected\n"
        
        answer += "\nCongestion Revenue Rights (CRRs) can be used to hedge against systematic congestion patterns."
        
        return {
            'answer': answer,
            'data': {'anomaly_count': anomaly_count, 'patterns': len(patterns)},
            'sources': ['POWER_UTILITIES_DB.ATOMIC.PRICE_ANOMALY_EVENT', 'POWER_UTILITIES_DB.ML.HIDDEN_PATTERN']
        }
