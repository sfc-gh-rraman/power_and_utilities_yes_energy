"""Weather data routes."""

from fastapi import APIRouter, Request

router = APIRouter()

@router.get("/{zone_code}")
async def get_weather_by_zone(request: Request, zone_code: str):
    """Get weather data for a specific zone."""
    cursor = request.app.state.snow_conn.cursor()
    
    cursor.execute(f"""
        SELECT ZONE_CODE, DATETIME_UTC, TEMP_F, WIND_SPEED_MPH, 
               HUMIDITY_PCT, CDD, HDD, WIND_CHILL_F, IS_EXTREME_WEATHER
        FROM POWER_UTILITIES_DB.ATOMIC.HOURLY_WEATHER
        WHERE ZONE_CODE = '{zone_code}'
        ORDER BY DATETIME_UTC DESC
        LIMIT 168
    """)
    
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]
