"""Price analysis routes."""

from fastapi import APIRouter, Request
from typing import Optional

router = APIRouter()

@router.get("/{zone_code}")
async def get_prices_by_zone(
    request: Request,
    zone_code: str,
    start: Optional[str] = None,
    end: Optional[str] = None
):
    """Get price data for a specific zone."""
    cursor = request.app.state.snow_conn.cursor()
    
    query = f"""
        SELECT ZONE_CODE, NODE_NAME, DATETIME_UTC, DA_LMP, RT_LMP, 
               RT_CONGESTION, DA_RT_SPREAD, IS_PRICE_SPIKE
        FROM POWER_UTILITIES_DB.ATOMIC.HOURLY_LMP
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
