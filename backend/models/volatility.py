"""Volatility analysis models from 03_risk_modeling notebook."""

import numpy as np
import pandas as pd
from typing import Optional


class VolatilityAnalyzer:
    def __init__(self, prices: pd.Series, freq: str = 'H'):
        self.prices = prices.copy()
        self.freq = freq
        self.returns = self.prices.pct_change().dropna()
        self.returns = self.returns.replace([np.inf, -np.inf], np.nan).dropna()
        self.log_returns = np.log(self.prices / self.prices.shift(1)).replace(
            [np.inf, -np.inf], np.nan
        ).dropna()
        
    def historical_volatility(self, window: int = 24) -> pd.Series:
        hourly_vol = self.returns.rolling(window=window).std()
        annualized = hourly_vol * np.sqrt(8760)
        return annualized
    
    def ewma_volatility(self, lambda_param: float = 0.94) -> pd.Series:
        squared_returns = self.returns ** 2
        ewma_var = squared_returns.ewm(alpha=1-lambda_param).mean()
        return np.sqrt(ewma_var) * np.sqrt(8760)
    
    def garch_estimate(
        self, 
        omega: float = 0.00001, 
        alpha: float = 0.1, 
        beta: float = 0.85
    ) -> pd.Series:
        returns_clean = self.returns.dropna()
        n = len(returns_clean)
        if n == 0:
            return pd.Series()
        
        sigma2 = np.zeros(n)
        sigma2[0] = returns_clean.var()
        returns_array = returns_clean.values
        
        for t in range(1, n):
            sigma2[t] = omega + alpha * returns_array[t-1]**2 + beta * sigma2[t-1]
        
        return pd.Series(np.sqrt(sigma2) * np.sqrt(8760), index=returns_clean.index)
    
    def get_summary(self) -> dict:
        return {
            'current_historical': float(self.historical_volatility().iloc[-1]) if len(self.historical_volatility()) > 0 else None,
            'current_ewma': float(self.ewma_volatility().iloc[-1]) if len(self.ewma_volatility()) > 0 else None,
            'current_garch': float(self.garch_estimate().iloc[-1]) if len(self.garch_estimate()) > 0 else None,
            'mean_return': float(self.returns.mean()),
            'return_std': float(self.returns.std()),
            'skewness': float(self.returns.skew()),
            'kurtosis': float(self.returns.kurtosis())
        }
