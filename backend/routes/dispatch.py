"""Dispatch simulation routes - stress testing and event replay."""

from fastapi import APIRouter, Request, Query
from typing import Optional
import pandas as pd
import sys
sys.path.insert(0, '..')
from models.stress_tester import StressTester, PREDEFINED_SCENARIOS

router = APIRouter()


def get_price_data(cursor, zone: str = 'LZ_HOUSTON', days: int = 90) -> pd.Series:
    try:
        cursor.execute(f"""
            SELECT d.DATETIME, d.RTLMP as RT_PRICE
            FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_PRICES d
            JOIN YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DS_OBJECT_LIST o 
                ON d.OBJECTID = o.OBJECTID
            WHERE o.OBJECTNAME = '{zone}'
              AND d.DATETIME >= DATEADD('day', -{days}, CURRENT_DATE())
            ORDER BY d.DATETIME
        """)
        rows = cursor.fetchall()
        if not rows:
            return pd.Series(dtype=float)
        df = pd.DataFrame(rows, columns=['DATETIME', 'RT_PRICE'])
        df['DATETIME'] = pd.to_datetime(df['DATETIME'])
        df['RT_PRICE'] = pd.to_numeric(df['RT_PRICE'], errors='coerce')
        prices = df.set_index('DATETIME')['RT_PRICE'].dropna()
        prices = prices[prices > 0]
        return prices
    except Exception as e:
        print(f"Error fetching price data: {e}")
        return pd.Series(dtype=float)


@router.get("/scenarios")
async def list_scenarios():
    return {
        'scenarios': [
            {
                'key': key,
                'name': s['name'],
                'price_level': s['price_level'],
                'duration_hours': s['duration_hours'],
                'description': s['description']
            }
            for key, s in PREDEFINED_SCENARIOS.items()
        ]
    }


@router.get("/simulate/{scenario_key}")
async def simulate_scenario(
    request: Request,
    scenario_key: str,
    capacity_mw: float = Query(100, description="DR capacity in MW"),
    zone: str = Query('HOUSTON', description="Zone for base price calculation")
):
    cursor = request.app.state.snow_conn.cursor()
    prices = get_price_data(cursor, f'LZ_{zone.upper()}', 365)
    
    if prices.empty:
        base_price = 50.0
    else:
        base_price = float(prices.mean())
    
    tester = StressTester(prices if not prices.empty else pd.Series([50.0]))
    
    try:
        result = tester.calculate_scenario_impact(scenario_key, capacity_mw, is_generator=False)
        result['zone'] = zone
        result['base_price_source'] = 'historical' if not prices.empty else 'default'
        return result
    except ValueError as e:
        return {"error": str(e)}


@router.get("/simulate-all")
async def simulate_all_scenarios(
    request: Request,
    capacity_mw: float = Query(100, description="DR capacity in MW"),
    zone: str = Query('HOUSTON', description="Zone for base price calculation")
):
    cursor = request.app.state.snow_conn.cursor()
    prices = get_price_data(cursor, f'LZ_{zone.upper()}', 365)
    
    tester = StressTester(prices if not prices.empty else pd.Series([50.0]))
    results = tester.run_all_scenarios(capacity_mw, is_generator=False)
    
    total_potential = sum(r.get('total_savings', 0) for r in results)
    
    return {
        'capacity_mw': capacity_mw,
        'zone': zone,
        'base_price': tester.base_price,
        'scenarios': results,
        'total_potential_savings': total_potential,
        'avg_savings_per_scenario': total_potential / len(results) if results else 0
    }


@router.get("/historical-events")
async def get_historical_events(
    request: Request,
    threshold_price: float = Query(500, description="Price threshold to identify events"),
    zone: str = Query('HOUSTON', description="Zone to analyze")
):
    cursor = request.app.state.snow_conn.cursor()
    
    cursor.execute(f"""
        SELECT 
            d.DATETIME,
            d.RTLMP as RT_PRICE,
            d.DALMP as DA_PRICE
        FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_PRICES d
        JOIN YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DS_OBJECT_LIST o 
            ON d.OBJECTID = o.OBJECTID
        WHERE o.OBJECTNAME = 'LZ_{zone.upper()}'
          AND d.RTLMP >= {threshold_price}
          AND d.DATETIME >= '2025-01-01'
        ORDER BY d.DATETIME
    """)
    
    rows = cursor.fetchall()
    
    events = []
    for row in rows:
        events.append({
            'datetime': str(row[0]),
            'rt_price': float(row[1]) if row[1] else 0,
            'da_price': float(row[2]) if row[2] else 0,
            'spread': float(row[1] - row[2]) if row[1] and row[2] else 0
        })
    
    if events:
        avg_spike_price = sum(e['rt_price'] for e in events) / len(events)
        max_spike_price = max(e['rt_price'] for e in events)
    else:
        avg_spike_price = 0
        max_spike_price = 0
    
    return {
        'zone': zone,
        'threshold_price': threshold_price,
        'event_count': len(events),
        'avg_spike_price': avg_spike_price,
        'max_spike_price': max_spike_price,
        'events': events[:100]
    }


@router.post("/custom-scenario")
async def create_custom_scenario(
    request: Request,
    name: str = Query(..., description="Scenario name"),
    price_level: float = Query(..., description="Stress price level"),
    duration_hours: int = Query(..., description="Duration in hours"),
    capacity_mw: float = Query(100, description="DR capacity in MW"),
    zone: str = Query('HOUSTON', description="Zone")
):
    cursor = request.app.state.snow_conn.cursor()
    prices = get_price_data(cursor, f'LZ_{zone.upper()}', 365)
    
    tester = StressTester(prices if not prices.empty else pd.Series([50.0]))
    tester.add_custom_scenario(name, price_level, duration_hours)
    
    result = tester.calculate_scenario_impact(name, capacity_mw, is_generator=False)
    result['zone'] = zone
    result['custom'] = True
    
    return result
