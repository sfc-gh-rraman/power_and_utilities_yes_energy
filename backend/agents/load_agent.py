"""Load Forecast Agent - Specialized agent for load/demand analysis."""

from typing import Optional
import json

class LoadForecastAgent:
    """Agent specialized in load forecasting and demand analysis."""
    
    name = "Load Forecast Agent"
    description = "Analyzes electricity demand patterns, forecasting accuracy, and load trends"
    
    def __init__(self, snow_conn):
        self.snow_conn = snow_conn
    
    async def process(self, query: str, context: Optional[str] = None) -> dict:
        """Process a load-related query."""
        cursor = self.snow_conn.cursor()
        
        cursor.execute("""
            SELECT 
                z.ZONE_CODE,
                z.ZONE_NAME,
                z.PEAK_LOAD_MW,
                m.MAPE AS FORECAST_ACCURACY
            FROM POWER_UTILITIES_DB.ATOMIC.LOAD_ZONE z
            CROSS JOIN POWER_UTILITIES_DB.ML.MODEL_REGISTRY m
            WHERE m.MODEL_NAME = 'LOAD_FORECASTER' AND m.IS_ACTIVE = TRUE
        """)
        
        zones = cursor.fetchall()
        
        zone_summary = []
        for zone in zones:
            zone_summary.append({
                'zone': zone[0],
                'name': zone[1],
                'peak_capacity': zone[2],
                'forecast_accuracy': zone[3]
            })
        
        answer = f"""Based on current data, here's the load forecast summary:

**System Overview:**
- Total ERCOT capacity: ~67,000 MW across 4 zones
- Current forecast model accuracy (MAPE): {zones[0][3] if zones else 'N/A'}%

**Zone Breakdown:**
"""
        for z in zone_summary:
            answer += f"- {z['name']}: Peak capacity {z['peak_capacity']:,} MW\n"
        
        answer += "\nThe physics-enhanced XGBoost model incorporates weather features (CDD, HDD, thermal inertia) for improved accuracy."
        
        return {
            'answer': answer,
            'data': zone_summary,
            'sources': ['POWER_UTILITIES_DB.ATOMIC.LOAD_ZONE', 'POWER_UTILITIES_DB.ML.MODEL_REGISTRY']
        }
