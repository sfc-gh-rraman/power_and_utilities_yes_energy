"""Grid status and load routes."""

from fastapi import APIRouter, Request
from typing import Optional

router = APIRouter()

@router.get("/status")
async def get_grid_status(request: Request):
    """Get current grid status for all zones."""
    cursor = request.app.state.snow_conn.cursor()
    cursor.execute("""
        SELECT * FROM POWER_UTILITIES_DB.ANALYTICS.V_REALTIME_GRID_STATUS
    """)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@router.get("/load/{zone_code}")
async def get_load_by_zone(
    request: Request, 
    zone_code: str, 
    start: Optional[str] = None, 
    end: Optional[str] = None
):
    """Get load data for a specific zone."""
    cursor = request.app.state.snow_conn.cursor()
    
    query = f"""
        SELECT ZONE_CODE, DATETIME_UTC, LOAD_MW, LOAD_FORECAST_MW, FORECAST_ERROR_PCT
        FROM POWER_UTILITIES_DB.ATOMIC.HOURLY_LOAD
        WHERE ZONE_CODE = '{zone_code}'
    """
    
    if start:
        query += f" AND DATETIME_UTC >= '{start}'"
    if end:
        query += f" AND DATETIME_UTC <= '{end}'"
    
    query += " ORDER BY DATETIME_UTC DESC LIMIT 168"
    
    cursor.execute(query)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@router.get("/anomalies")
async def get_anomalies(request: Request, days: int = 7):
    """Get recent price anomaly events."""
    cursor = request.app.state.snow_conn.cursor()
    cursor.execute(f"""
        SELECT * FROM POWER_UTILITIES_DB.ATOMIC.PRICE_ANOMALY_EVENT
        WHERE EVENT_START >= DATEADD('day', -{days}, CURRENT_DATE())
        ORDER BY EVENT_START DESC
    """)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@router.get("/brief")
async def get_morning_brief(request: Request):
    """Get morning brief data."""
    cursor = request.app.state.snow_conn.cursor()
    cursor.execute("""
        SELECT * FROM POWER_UTILITIES_DB.ANALYTICS.V_MORNING_BRIEF_DATA
    """)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
