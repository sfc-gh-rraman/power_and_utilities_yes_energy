"""Stress testing scenarios from 03_risk_modeling notebook."""

import numpy as np
import pandas as pd
from typing import Dict, Tuple, Optional


PREDEFINED_SCENARIOS = {
    'winter_storm_uri': {
        'name': 'Winter Storm Uri (Feb 2021)',
        'price_level': 9000,
        'duration_hours': 72,
        'description': 'Extreme cold event - prices at $9000/MWh cap for 72 hours'
    },
    'summer_peak_2023': {
        'name': 'Summer Peak 2023',
        'price_level': 5000,
        'duration_hours': 8,
        'description': 'Record summer demand - prices spike to $5000/MWh for 8 hours'
    },
    'gas_supply_disruption': {
        'name': 'Gas Supply Disruption',
        'price_level': 2000,
        'duration_hours': 24,
        'description': 'Pipeline outage - elevated prices at $2000/MWh for 24 hours'
    },
    'renewable_curtailment': {
        'name': 'Low Wind + High Demand',
        'price_level': 500,
        'duration_hours': 48,
        'description': 'Wind generation collapse during heat wave'
    },
    'moderate_peak': {
        'name': 'Typical Summer Peak',
        'price_level': 200,
        'duration_hours': 4,
        'description': 'Normal summer afternoon peak event'
    }
}


class StressTester:
    def __init__(self, prices: pd.Series, returns: Optional[pd.Series] = None):
        self.prices = prices
        self.returns = returns if returns is not None else prices.pct_change().dropna()
        self.base_price = float(prices.mean())
        self.scenarios = {}
        
        for key, scenario in PREDEFINED_SCENARIOS.items():
            self.scenarios[key] = scenario.copy()
            self.scenarios[key]['type'] = 'predefined'
    
    def add_custom_scenario(
        self, 
        name: str, 
        price_level: float, 
        duration_hours: int,
        description: str = ''
    ):
        self.scenarios[name] = {
            'name': name,
            'type': 'custom',
            'price_level': price_level,
            'duration': duration_hours,
            'description': description or f'Price spike to ${price_level}/MWh for {duration_hours} hours'
        }
    
    def calculate_scenario_impact(
        self, 
        scenario_key: str, 
        capacity_mw: float,
        is_generator: bool = False
    ) -> Dict:
        if scenario_key not in self.scenarios:
            raise ValueError(f"Unknown scenario: {scenario_key}")
        
        scenario = self.scenarios[scenario_key]
        stress_price = scenario['price_level']
        duration = scenario.get('duration_hours', scenario.get('duration', 1))
        
        if is_generator:
            revenue_per_mwh = stress_price - self.base_price
            total_revenue = revenue_per_mwh * capacity_mw * duration
            metric_name = 'revenue'
        else:
            savings_per_mwh = stress_price - self.base_price
            total_savings = savings_per_mwh * capacity_mw * duration
            revenue_per_mwh = savings_per_mwh
            total_revenue = total_savings
            metric_name = 'savings'
        
        return {
            'scenario': scenario['name'],
            'description': scenario['description'],
            'base_price': self.base_price,
            'stress_price': stress_price,
            'duration_hours': duration,
            'capacity_mw': capacity_mw,
            f'{metric_name}_per_mwh': revenue_per_mwh,
            f'total_{metric_name}': total_revenue,
            'total_mwh': capacity_mw * duration
        }
    
    def run_all_scenarios(self, capacity_mw: float, is_generator: bool = False) -> list:
        results = []
        for scenario_key in self.scenarios:
            result = self.calculate_scenario_impact(scenario_key, capacity_mw, is_generator)
            result['scenario_key'] = scenario_key
            results.append(result)
        return sorted(results, key=lambda x: x.get('total_savings', x.get('total_revenue', 0)), reverse=True)
    
    def get_scenario_list(self) -> list:
        return [
            {
                'key': key,
                'name': s['name'],
                'price_level': s['price_level'],
                'duration_hours': s.get('duration_hours', s.get('duration', 0)),
                'description': s['description'],
                'type': s['type']
            }
            for key, s in self.scenarios.items()
        ]
