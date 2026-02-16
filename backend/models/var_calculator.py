"""Value at Risk calculations from 03_risk_modeling notebook."""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Tuple


class VaRCalculator:
    def __init__(self, returns: pd.Series):
        self.returns = returns.dropna()
        
    def parametric_var(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000
    ) -> Tuple[float, float]:
        mu = self.returns.mean()
        sigma = self.returns.std()
        z_score = stats.norm.ppf(1 - confidence)
        var_pct = mu + z_score * sigma
        return -var_pct * position_value, -var_pct
    
    def historical_var(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000
    ) -> Tuple[float, float]:
        var_pct = self.returns.quantile(1 - confidence)
        return -var_pct * position_value, -var_pct
    
    def monte_carlo_var(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000,
        n_sims: int = 10000
    ) -> Tuple[float, float]:
        params = stats.t.fit(self.returns)
        simulated = stats.t.rvs(*params, size=n_sims)
        var_pct = np.percentile(simulated, (1 - confidence) * 100)
        return -var_pct * position_value, -var_pct
    
    def cornish_fisher_var(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000
    ) -> Tuple[float, float]:
        mu = self.returns.mean()
        sigma = self.returns.std()
        S = stats.skew(self.returns)
        K = stats.kurtosis(self.returns)
        z = stats.norm.ppf(1 - confidence)
        z_cf = (z + (z**2 - 1) * S / 6 + 
                (z**3 - 3*z) * (K - 3) / 24 - 
                (2*z**3 - 5*z) * S**2 / 36)
        var_pct = mu + z_cf * sigma
        return -var_pct * position_value, -var_pct
    
    def expected_shortfall(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000
    ) -> Tuple[float, float]:
        var_threshold = self.returns.quantile(1 - confidence)
        es_pct = self.returns[self.returns <= var_threshold].mean()
        return -es_pct * position_value, -es_pct
    
    def get_all_var_metrics(
        self, 
        confidence: float = 0.95, 
        position_value: float = 1000000
    ) -> dict:
        parametric = self.parametric_var(confidence, position_value)
        historical = self.historical_var(confidence, position_value)
        monte_carlo = self.monte_carlo_var(confidence, position_value)
        cornish_fisher = self.cornish_fisher_var(confidence, position_value)
        es = self.expected_shortfall(confidence, position_value)
        
        return {
            'confidence_level': confidence,
            'position_value': position_value,
            'parametric_var': {'dollar': parametric[0], 'percent': parametric[1]},
            'historical_var': {'dollar': historical[0], 'percent': historical[1]},
            'monte_carlo_var': {'dollar': monte_carlo[0], 'percent': monte_carlo[1]},
            'cornish_fisher_var': {'dollar': cornish_fisher[0], 'percent': cornish_fisher[1]},
            'expected_shortfall': {'dollar': es[0], 'percent': es[1]}
        }
