"""Peak prediction and 4CP probability routes."""

from fastapi import APIRouter, Request, Query
from typing import Optional
import pandas as pd
import sys
sys.path.insert(0, '..')
from models.peak_predictor import PeakPredictor

router = APIRouter()


@router.get("/probability")
async def get_4cp_probability(
    request: Request,
    load_mw: float = Query(70000, description="Current system load in MW"),
    temp_f: float = Query(95, description="Forecast temperature in Fahrenheit"),
    hour: int = Query(17, description="Hour of day (0-23)"),
    month: int = Query(8, description="Month (1-12)")
):
    try:
        cursor = request.app.state.snow_conn.cursor()
        cursor.execute("""
            SELECT DATETIME, TOTAL_LOAD_MW 
            FROM (
                SELECT d.DATETIME, SUM(d.RTLOAD) as TOTAL_LOAD_MW
                FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS d
                WHERE d.DATETIME >= DATEADD('month', -6, CURRENT_DATE())
                GROUP BY d.DATETIME
                ORDER BY d.DATETIME DESC
                LIMIT 1000
            )
        """)
        
        rows = cursor.fetchall()
        if rows:
            load_df = pd.DataFrame(rows, columns=['DATETIME', 'TOTAL_LOAD_MW'])
            load_df['TOTAL_LOAD_MW'] = pd.to_numeric(load_df['TOTAL_LOAD_MW'], errors='coerce')
        else:
            load_df = pd.DataFrame()
        
        predictor = PeakPredictor(load_df)
        result = predictor.calculate_4cp_probability(
            current_load_mw=load_mw,
            forecast_temp_f=temp_f,
            hour=hour,
            month=month
        )
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "probability": 0.0}


@router.get("/historical")
async def get_historical_peaks(
    request: Request,
    year: Optional[int] = None
):
    predictor = PeakPredictor(pd.DataFrame())
    return predictor.get_historical_peaks(year)


@router.get("/dr-value")
async def calculate_dr_value(
    request: Request,
    capacity_mw: float = Query(100, description="DR capacity in MW"),
    probability: float = Query(0.5, description="4CP probability (0-1)"),
    transmission_rate: float = Query(85, description="Transmission rate $/kW-year")
):
    predictor = PeakPredictor(pd.DataFrame())
    return predictor.calculate_dr_value(capacity_mw, probability, transmission_rate)


@router.get("/current-conditions")
async def get_current_conditions(request: Request):
    try:
        cursor = request.app.state.snow_conn.cursor()
        
        cursor.execute("""
            SELECT 
                d.DATETIME,
                SUM(d.RTLOAD) as SYSTEM_LOAD_MW,
                AVG(d.DALOAD) as FORECAST_MW
            FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS d
            WHERE d.DATETIME >= DATEADD('hour', -24, CURRENT_TIMESTAMP())
            GROUP BY d.DATETIME
            ORDER BY d.DATETIME DESC
            LIMIT 24
        """)
        
        load_rows = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                DATETIME,
                AVG(TEMP_F) as AVG_TEMP_F,
                MAX(TEMP_F) as MAX_TEMP_F
            FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.ALL_WEATHER_MV
            WHERE DATETIME >= DATEADD('hour', -24, CURRENT_TIMESTAMP())
            GROUP BY DATETIME
            ORDER BY DATETIME DESC
            LIMIT 24
        """)
        
        weather_rows = cursor.fetchall()
        
        current_load = float(load_rows[0][1]) if load_rows and load_rows[0][1] else 65000
        current_temp = float(weather_rows[0][1]) if weather_rows and weather_rows[0][1] else 85
        
        from datetime import datetime
        now = datetime.now()
        predictor = PeakPredictor(pd.DataFrame())
        
        probability = predictor.calculate_4cp_probability(
            current_load_mw=current_load,
            forecast_temp_f=current_temp,
            hour=now.hour,
            month=now.month
        )
        
        return {
            'timestamp': now.isoformat(),
            'current_load_mw': current_load,
            'current_temp_f': current_temp,
            'hour': now.hour,
            'month': now.month,
            '4cp_prediction': probability,
            'load_trend': [
                {'datetime': str(r[0]), 'load_mw': float(r[1]) if r[1] else 0} 
                for r in load_rows[:12]
            ],
            'temp_trend': [
                {'datetime': str(r[0]), 'temp_f': float(r[1]) if r[1] else 0} 
                for r in weather_rows[:12]
            ]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        from datetime import datetime
        return {
            'timestamp': datetime.now().isoformat(),
            'error': str(e),
            'current_load_mw': 65000,
            'current_temp_f': 85,
            '4cp_prediction': {'probability': 0.0}
        }
