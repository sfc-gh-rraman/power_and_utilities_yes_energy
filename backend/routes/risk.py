"""Risk analytics routes - VaR, volatility, Monte Carlo."""

from fastapi import APIRouter, Request, Query
from typing import Optional
import pandas as pd
import numpy as np
import sys
sys.path.insert(0, '..')
from models.volatility import VolatilityAnalyzer
from models.var_calculator import VaRCalculator
from models.monte_carlo import MonteCarloSimulator

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


@router.get("/volatility/{zone}")
async def get_volatility(
    request: Request,
    zone: str,
    days: int = Query(90, description="Days of historical data")
):
    try:
        cursor = request.app.state.snow_conn.cursor()
        prices = get_price_data(cursor, f'LZ_{zone.upper()}', days)
        
        if prices.empty:
            return {"error": "No price data found", "zone": zone}
        
        analyzer = VolatilityAnalyzer(prices)
        summary = analyzer.get_summary()
        
        for key, val in summary.items():
            if val is not None and (np.isnan(val) or np.isinf(val)):
                summary[key] = None
        
        hist_vol = analyzer.historical_volatility()
        ewma_vol = analyzer.ewma_volatility()
        garch_vol = analyzer.garch_estimate()
        
        recent_vol = []
        n_points = min(168, len(hist_vol))
        for i in range(-n_points, 0):
            try:
                idx = hist_vol.index[i]
                h_val = float(hist_vol.iloc[i]) if not np.isnan(hist_vol.iloc[i]) else None
                e_val = float(ewma_vol.iloc[i]) if i < len(ewma_vol) and not np.isnan(ewma_vol.iloc[i]) else None
                g_val = float(garch_vol.iloc[i]) if i < len(garch_vol) and not np.isnan(garch_vol.iloc[i]) else None
                recent_vol.append({
                    'datetime': str(idx),
                    'historical': h_val,
                    'ewma': e_val,
                    'garch': g_val
                })
            except (IndexError, ValueError):
                continue
        
        return {
            'zone': zone,
            'days_analyzed': days,
            'data_points': len(prices),
            'summary': summary,
            'volatility_series': recent_vol[-48:]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "zone": zone}


@router.get("/var/{zone}")
async def get_var_metrics(
    request: Request,
    zone: str,
    confidence: float = Query(0.95, description="VaR confidence level"),
    position_value: float = Query(1000000, description="Position value in dollars"),
    days: int = Query(90, description="Days of historical data")
):
    try:
        cursor = request.app.state.snow_conn.cursor()
        prices = get_price_data(cursor, f'LZ_{zone.upper()}', days)
        
        if prices.empty:
            return {"error": "No price data found", "zone": zone}
        
        returns = prices.pct_change().replace([np.inf, -np.inf], np.nan).dropna()
        calculator = VaRCalculator(returns)
        
        metrics = calculator.get_all_var_metrics(confidence, position_value)
        metrics['zone'] = zone
        metrics['days_analyzed'] = days
        
        return metrics
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "zone": zone}


@router.get("/monte-carlo/{zone}")
async def run_monte_carlo(
    request: Request,
    zone: str,
    capacity_mw: float = Query(100, description="Capacity in MW"),
    hours: int = Query(24, description="Simulation horizon in hours"),
    n_paths: int = Query(1000, description="Number of simulation paths"),
    model: str = Query('gbm', description="Model type: gbm, jump, mean_revert")
):
    try:
        cursor = request.app.state.snow_conn.cursor()
        prices = get_price_data(cursor, f'LZ_{zone.upper()}', 90)
        
        if prices.empty:
            return {"error": "No price data found", "zone": zone}
        
        simulator = MonteCarloSimulator(prices)
        result = simulator.simulate_revenue(
            capacity_mw=capacity_mw,
            hours=hours,
            n_paths=n_paths,
            model=model
        )
        result['zone'] = zone
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "zone": zone}


@router.get("/summary")
async def get_risk_summary(request: Request):
    try:
        cursor = request.app.state.snow_conn.cursor()
        zones = ['LZ_HOUSTON', 'LZ_NORTH', 'LZ_SOUTH', 'LZ_WEST']
        
        summaries = []
        for zone in zones:
            try:
                prices = get_price_data(cursor, zone, 30)
                if prices.empty:
                    continue
                    
                analyzer = VolatilityAnalyzer(prices)
                returns = prices.pct_change().replace([np.inf, -np.inf], np.nan).dropna()
                var_calc = VaRCalculator(returns)
                
                var_95 = var_calc.historical_var(0.95, 1000000)
                vol = analyzer.get_summary().get('current_ewma')
                if vol is not None and (np.isnan(vol) or np.isinf(vol)):
                    vol = None
                
                summaries.append({
                    'zone': zone.replace('LZ_', ''),
                    'current_price': float(prices.iloc[-1]) if len(prices) > 0 else None,
                    'avg_price': float(prices.mean()),
                    'volatility_annualized': vol,
                    'var_95_dollar': var_95[0] if var_95[0] is not None and not np.isnan(var_95[0]) else None,
                    'var_95_pct': (var_95[1] * 100) if var_95[1] is not None and not np.isnan(var_95[1]) else None
                })
            except Exception as zone_err:
                print(f"Error processing zone {zone}: {zone_err}")
                continue
        
        return {'zones': summaries, 'analysis_period_days': 30}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "zones": []}
