import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Activity,
  Shuffle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import api from '../services/api';

function VaRCard({ title, value, percent, color }: { title: string; value: number; percent: number; color: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-xl font-bold" style={{ color }}>
        ${(value / 1000).toFixed(0)}K
      </p>
      <p className="text-sm text-slate-500">{(percent * 100).toFixed(2)}%</p>
    </div>
  );
}

function ZoneSummaryCard({ zone }: { zone: any }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{zone.zone}</h3>
        <span className={`text-sm px-2 py-1 rounded ${
          zone.volatility_annualized > 1000 ? 'bg-red-500/20 text-red-400' :
          zone.volatility_annualized > 500 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {zone.volatility_annualized?.toFixed(0)}% vol
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Current Price</p>
          <p className="font-semibold">${zone.current_price?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400">Avg Price</p>
          <p className="font-semibold">${zone.avg_price?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400">95% VaR</p>
          <p className="font-semibold text-red-400">${(zone.var_95_dollar / 1000).toFixed(0)}K</p>
        </div>
        <div>
          <p className="text-slate-400">VaR %</p>
          <p className="font-semibold">{zone.var_95_pct?.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

export default function RevenueRisk() {
  const [zone, setZone] = useState('HOUSTON');
  const [positionValue, setPositionValue] = useState(1000000);
  const [capacityMw, setCapacityMw] = useState(100);

  const { data: riskSummary } = useQuery({
    queryKey: ['risk-summary'],
    queryFn: () => api.get('/api/risk/summary').then(r => r.data)
  });

  const { data: varMetrics } = useQuery({
    queryKey: ['var-metrics', zone, positionValue],
    queryFn: () => api.get(`/api/risk/var/${zone}?position_value=${positionValue}`).then(r => r.data)
  });

  const { data: volatility } = useQuery({
    queryKey: ['volatility', zone],
    queryFn: () => api.get(`/api/risk/volatility/${zone}`).then(r => r.data)
  });

  const { data: monteCarlo } = useQuery({
    queryKey: ['monte-carlo', zone, capacityMw],
    queryFn: () => api.get(`/api/risk/monte-carlo/${zone}?capacity_mw=${capacityMw}&hours=24&n_paths=1000`).then(r => r.data)
  });

  const volChartData = volatility?.volatility_series?.map((v: any) => ({
    time: v.datetime?.split('T')[1]?.substring(0, 5) || '',
    historical: v.historical,
    ewma: v.ewma,
    garch: v.garch
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Risk Analytics</h1>
          <p className="text-slate-400 mt-1">VaR, volatility, and Monte Carlo projections</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-slate-400 mr-2">Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HOUSTON">Houston</option>
              <option value="NORTH">North</option>
              <option value="SOUTH">South</option>
              <option value="WEST">West</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mr-2">Position</label>
            <input
              type="number"
              value={positionValue}
              onChange={(e) => setPositionValue(Number(e.target.value))}
              className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {riskSummary?.zones?.map((z: any) => (
          <ZoneSummaryCard key={z.zone} zone={z} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Value at Risk - {zone}
          </h3>
          {varMetrics && (
            <div className="grid grid-cols-2 gap-4">
              <VaRCard 
                title="Parametric VaR" 
                value={varMetrics.parametric_var?.dollar || 0}
                percent={varMetrics.parametric_var?.percent || 0}
                color="#ef4444"
              />
              <VaRCard 
                title="Historical VaR" 
                value={varMetrics.historical_var?.dollar || 0}
                percent={varMetrics.historical_var?.percent || 0}
                color="#f97316"
              />
              <VaRCard 
                title="Monte Carlo VaR" 
                value={varMetrics.monte_carlo_var?.dollar || 0}
                percent={varMetrics.monte_carlo_var?.percent || 0}
                color="#eab308"
              />
              <VaRCard 
                title="Expected Shortfall" 
                value={varMetrics.expected_shortfall?.dollar || 0}
                percent={varMetrics.expected_shortfall?.percent || 0}
                color="#dc2626"
              />
            </div>
          )}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">95% Confidence:</span> There is a 5% chance 
              of losing more than the VaR amount in any given period.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Volatility Models
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volChartData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${(v/100).toFixed(0)}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(v: number) => [`${v?.toFixed(0)}%`, '']}
                />
                <Line type="monotone" dataKey="historical" stroke="#3b82f6" strokeWidth={2} dot={false} name="Historical" />
                <Line type="monotone" dataKey="ewma" stroke="#10b981" strokeWidth={2} dot={false} name="EWMA" />
                <Line type="monotone" dataKey="garch" stroke="#f59e0b" strokeWidth={2} dot={false} name="GARCH" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {volatility?.summary && (
            <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-slate-400">Skewness</p>
                <p className="font-semibold">{volatility.summary.skewness?.toFixed(2)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-slate-400">Kurtosis</p>
                <p className="font-semibold">{volatility.summary.kurtosis?.toFixed(2)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                <p className="text-slate-400">Avg Return</p>
                <p className="font-semibold">{(volatility.summary.mean_return * 100)?.toFixed(3)}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-purple-400" />
            Monte Carlo Revenue Simulation - {zone}
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Capacity</label>
            <input
              type="number"
              value={capacityMw}
              onChange={(e) => setCapacityMw(Number(e.target.value))}
              className="w-20 bg-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-400">MW</span>
          </div>
        </div>
        
        {monteCarlo && (
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-500/30">
              <p className="text-slate-400 text-sm">Expected Revenue</p>
              <p className="text-2xl font-bold text-purple-400">
                ${(monteCarlo.mean_revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm">P10 (Downside)</p>
              <p className="text-xl font-bold text-red-400">
                ${(monteCarlo.p10_revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm">P50 (Median)</p>
              <p className="text-xl font-bold">
                ${(monteCarlo.p50_revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm">P90 (Upside)</p>
              <p className="text-xl font-bold text-green-400">
                ${(monteCarlo.p90_revenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm">95% VaR</p>
              <p className="text-xl font-bold text-orange-400">
                ${(monteCarlo.var_95 / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        )}
        
        {monteCarlo?.path_stats && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Price Path Statistics (24h horizon)</h4>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Initial</p>
                <p className="font-semibold">${monteCarlo.path_stats.initial_price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">Mean Final</p>
                <p className="font-semibold">${monteCarlo.path_stats.mean_final?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">P5</p>
                <p className="font-semibold text-red-400">${monteCarlo.path_stats.p5?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">P50</p>
                <p className="font-semibold">${monteCarlo.path_stats.p50?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">P95</p>
                <p className="font-semibold text-green-400">${monteCarlo.path_stats.p95?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-slate-400">Max</p>
                <p className="font-semibold">${monteCarlo.path_stats.max?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
