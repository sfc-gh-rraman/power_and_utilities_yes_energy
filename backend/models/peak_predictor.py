"""Peak prediction model using physics features from 01_load_forecast notebook."""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime


HISTORICAL_4CP_DATES = [
    {'year': 2024, 'month': 6, 'day': 26, 'hour': 17, 'load_mw': 74521},
    {'year': 2024, 'month': 7, 'day': 22, 'hour': 17, 'load_mw': 76234},
    {'year': 2024, 'month': 8, 'day': 20, 'hour': 17, 'load_mw': 77892},
    {'year': 2024, 'month': 9, 'day': 5, 'hour': 16, 'load_mw': 73156},
    {'year': 2023, 'month': 6, 'day': 27, 'hour': 17, 'load_mw': 72891},
    {'year': 2023, 'month': 7, 'day': 27, 'hour': 17, 'load_mw': 75432},
    {'year': 2023, 'month': 8, 'day': 10, 'hour': 17, 'load_mw': 85464},
    {'year': 2023, 'month': 9, 'day': 6, 'hour': 16, 'load_mw': 71234},
]


class PeakPredictor:
    def __init__(self, load_data: pd.DataFrame, weather_data: Optional[pd.DataFrame] = None):
        self.load_data = load_data
        self.weather_data = weather_data
        self.historical_peaks = HISTORICAL_4CP_DATES
        
    def calculate_physics_features(self, temp_f: float, wind_mph: float = 5) -> Dict:
        cdd = max(0, temp_f - 65)
        hdd = max(0, 65 - temp_f)
        
        if wind_mph > 3 and temp_f < 50:
            wind_chill = (35.74 + 0.6215 * temp_f - 
                        35.75 * (wind_mph ** 0.16) + 
                        0.4275 * temp_f * (wind_mph ** 0.16))
        else:
            wind_chill = temp_f
            
        if temp_f > 80:
            heat_index = temp_f + 0.5 * (temp_f - 80)
        else:
            heat_index = temp_f
            
        return {
            'temperature_f': temp_f,
            'cdd': cdd,
            'hdd': hdd,
            'wind_chill': wind_chill,
            'heat_index': heat_index,
            'cooling_demand_factor': cdd / 35 if cdd > 0 else 0,
            'heating_demand_factor': hdd / 35 if hdd > 0 else 0
        }
    
    def calculate_4cp_probability(
        self,
        current_load_mw: float,
        forecast_temp_f: float,
        hour: int,
        month: int,
        is_weekday: bool = True
    ) -> Dict:
        if month not in [6, 7, 8, 9]:
            return {
                'probability': 0.0,
                'risk_level': 'NONE',
                'reason': '4CP only occurs June-September',
                'factors': {}
            }
        
        peak_hours = [15, 16, 17, 18]
        physics = self.calculate_physics_features(forecast_temp_f)
        
        base_prob = 0.0
        factors = {}
        
        if hour in peak_hours:
            base_prob += 0.15
            factors['peak_hour'] = '+15%'
        
        if forecast_temp_f >= 100:
            temp_factor = 0.35
        elif forecast_temp_f >= 95:
            temp_factor = 0.25
        elif forecast_temp_f >= 90:
            temp_factor = 0.15
        elif forecast_temp_f >= 85:
            temp_factor = 0.08
        else:
            temp_factor = 0.02
        base_prob += temp_factor
        factors['temperature'] = f'+{int(temp_factor*100)}%'
        
        monthly_peaks = [p for p in self.historical_peaks if p['month'] == month]
        if monthly_peaks:
            avg_peak = np.mean([p['load_mw'] for p in monthly_peaks])
            load_ratio = current_load_mw / avg_peak
            if load_ratio >= 0.98:
                load_factor = 0.30
            elif load_ratio >= 0.95:
                load_factor = 0.20
            elif load_ratio >= 0.90:
                load_factor = 0.10
            else:
                load_factor = 0.02
            base_prob += load_factor
            factors['load_level'] = f'+{int(load_factor*100)}% (vs avg peak)'
        
        if is_weekday:
            base_prob += 0.05
            factors['weekday'] = '+5%'
        
        base_prob = min(0.95, max(0.0, base_prob))
        
        if base_prob >= 0.7:
            risk_level = 'CRITICAL'
        elif base_prob >= 0.5:
            risk_level = 'HIGH'
        elif base_prob >= 0.3:
            risk_level = 'ELEVATED'
        elif base_prob >= 0.1:
            risk_level = 'MODERATE'
        else:
            risk_level = 'LOW'
        
        return {
            'probability': round(base_prob, 3),
            'probability_pct': round(base_prob * 100, 1),
            'risk_level': risk_level,
            'physics_features': physics,
            'factors': factors,
            'current_load_mw': current_load_mw,
            'forecast_temp_f': forecast_temp_f,
            'month': month,
            'hour': hour
        }
    
    def get_historical_peaks(self, year: Optional[int] = None) -> List[Dict]:
        if year:
            return [p for p in self.historical_peaks if p['year'] == year]
        return self.historical_peaks
    
    def calculate_dr_value(
        self,
        capacity_mw: float,
        probability: float,
        transmission_rate: float = 85.0
    ) -> Dict:
        expected_events = 4
        expected_savings = capacity_mw * transmission_rate * 12 * probability
        max_savings = capacity_mw * transmission_rate * 12
        
        return {
            'capacity_mw': capacity_mw,
            'transmission_rate_per_kw_year': transmission_rate,
            '4cp_probability': probability,
            'expected_annual_savings': expected_savings,
            'max_annual_savings': max_savings,
            'savings_per_mw': expected_savings / capacity_mw if capacity_mw > 0 else 0
        }
