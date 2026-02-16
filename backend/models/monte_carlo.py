"""Monte Carlo simulation models from 03_risk_modeling notebook."""

import numpy as np
import pandas as pd
from typing import Optional, Dict


class MonteCarloSimulator:
    def __init__(self, prices: pd.Series, returns: Optional[pd.Series] = None):
        self.prices = prices
        self.returns = returns if returns is not None else prices.pct_change().dropna()
        self.returns = self.returns.replace([np.inf, -np.inf], np.nan).dropna()
        self.mu = float(self.returns.mean())
        self.sigma = float(self.returns.std())
        self.S0 = float(prices.iloc[-1])
        
    def simulate_gbm(
        self, 
        n_paths: int = 1000, 
        n_steps: int = 24,
        dt: float = 1/8760
    ) -> np.ndarray:
        paths = np.zeros((n_steps + 1, n_paths))
        paths[0] = self.S0
        
        for t in range(1, n_steps + 1):
            z = np.random.standard_normal(n_paths)
            paths[t] = paths[t-1] * np.exp(
                (self.mu - 0.5 * self.sigma**2) * dt + 
                self.sigma * np.sqrt(dt) * z
            )
        return paths
    
    def simulate_jump_diffusion(
        self,
        n_paths: int = 1000,
        n_steps: int = 24,
        lambda_jump: float = 0.01,
        jump_mean: float = 0.5,
        jump_std: float = 1.0,
        dt: float = 1/8760
    ) -> np.ndarray:
        paths = np.zeros((n_steps + 1, n_paths))
        paths[0] = self.S0
        
        for t in range(1, n_steps + 1):
            z = np.random.standard_normal(n_paths)
            jumps = np.random.poisson(lambda_jump * dt, n_paths)
            jump_sizes = np.random.normal(jump_mean, jump_std, n_paths) * jumps
            
            paths[t] = paths[t-1] * np.exp(
                (self.mu - 0.5 * self.sigma**2) * dt +
                self.sigma * np.sqrt(dt) * z +
                jump_sizes
            )
        return paths
    
    def simulate_mean_reverting(
        self,
        n_paths: int = 1000,
        n_steps: int = 24,
        kappa: float = 0.1,
        theta: Optional[float] = None,
        dt: float = 1/8760
    ) -> np.ndarray:
        if theta is None:
            theta = self.S0
            
        paths = np.zeros((n_steps + 1, n_paths))
        paths[0] = self.S0
        
        for t in range(1, n_steps + 1):
            z = np.random.standard_normal(n_paths)
            paths[t] = (paths[t-1] + 
                       kappa * (theta - paths[t-1]) * dt +
                       self.sigma * np.sqrt(dt) * z * paths[t-1])
            paths[t] = np.maximum(paths[t], 0)
        return paths
    
    def calculate_path_statistics(self, paths: np.ndarray) -> Dict:
        final_prices = paths[-1, :]
        return {
            'initial_price': float(paths[0, 0]),
            'mean_final': float(np.mean(final_prices)),
            'std_final': float(np.std(final_prices)),
            'p5': float(np.percentile(final_prices, 5)),
            'p10': float(np.percentile(final_prices, 10)),
            'p25': float(np.percentile(final_prices, 25)),
            'p50': float(np.percentile(final_prices, 50)),
            'p75': float(np.percentile(final_prices, 75)),
            'p90': float(np.percentile(final_prices, 90)),
            'p95': float(np.percentile(final_prices, 95)),
            'min': float(np.min(final_prices)),
            'max': float(np.max(final_prices))
        }
    
    def simulate_revenue(
        self,
        capacity_mw: float,
        hours: int = 24,
        n_paths: int = 1000,
        model: str = 'gbm'
    ) -> Dict:
        if model == 'gbm':
            paths = self.simulate_gbm(n_paths, hours)
        elif model == 'jump':
            paths = self.simulate_jump_diffusion(n_paths, hours)
        elif model == 'mean_revert':
            paths = self.simulate_mean_reverting(n_paths, hours)
        else:
            raise ValueError(f"Unknown model: {model}")
        
        revenues = np.sum(paths[1:, :], axis=0) * capacity_mw
        
        return {
            'model': model,
            'capacity_mw': capacity_mw,
            'hours': hours,
            'n_simulations': n_paths,
            'mean_revenue': float(np.mean(revenues)),
            'std_revenue': float(np.std(revenues)),
            'p5_revenue': float(np.percentile(revenues, 5)),
            'p10_revenue': float(np.percentile(revenues, 10)),
            'p50_revenue': float(np.percentile(revenues, 50)),
            'p90_revenue': float(np.percentile(revenues, 90)),
            'p95_revenue': float(np.percentile(revenues, 95)),
            'var_95': float(np.mean(revenues) - np.percentile(revenues, 5)),
            'path_stats': self.calculate_path_statistics(paths)
        }
