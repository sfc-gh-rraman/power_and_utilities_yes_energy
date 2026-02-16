import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Activity, 
  Target,
  BarChart3,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';
import api from '../services/api';

const mockForecastData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  actual: 45000 + Math.sin(i / 4) * 15000 + Math.random() * 2000,
  forecast: 45000 + Math.sin(i / 4) * 15000,
  error: (Math.random() - 0.5) * 3
}));

const zoneLoads = [
  { zone: 'Houston', load: 18500, forecast: 18200, mape: 1.6, peak: 22500 },
  { zone: 'North', load: 21200, forecast: 20800, mape: 1.9, peak: 26000 },
  { zone: 'South', load: 9800, forecast: 9950, mape: 1.5, peak: 12500 },
  { zone: 'West', load: 6200, forecast: 6100, mape: 1.6, peak: 8000 },
];

const historicalMape = [
  { month: 'Sep', mape: 2.1 },
  { month: 'Oct', mape: 1.9 },
  { month: 'Nov', mape: 1.7 },
  { month: 'Dec', mape: 2.3 },
  { month: 'Jan', mape: 2.8 },
  { month: 'Feb', mape: 1.8 },
];

export default function LoadAnalysis() {
  const [selectedZone, setSelectedZone] = useState('ALL');
  const totalLoad = zoneLoads.reduce((sum, z) => sum + z.load, 0);
  const totalForecast = zoneLoads.reduce((sum, z) => sum + z.forecast, 0);
  const avgMape = zoneLoads.reduce((sum, z) => sum + z.mape, 0) / zoneLoads.length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Load Analysis</h1>
          <p className="text-slate-400 mt-1">Load forecasting performance and demand patterns</p>
        </div>
        <div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Zones</option>
            <option value="HOUSTON">Houston</option>
            <option value="NORTH">North</option>
            <option value="SOUTH">South</option>
            <option value="WEST">West</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400">Current Load</span>
          </div>
          <p className="text-3xl font-bold">{(totalLoad / 1000).toFixed(1)}k</p>
          <p className="text-sm text-slate-500 mt-1">MW total ERCOT</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Forecast</span>
          </div>
          <p className="text-3xl font-bold">{(totalForecast / 1000).toFixed(1)}k</p>
          <p className="text-sm text-slate-500 mt-1">MW predicted</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400">Avg MAPE</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{avgMape.toFixed(1)}%</p>
          <p className="text-sm text-slate-500 mt-1">forecast error</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">Peak Forecast</span>
          </div>
          <p className="text-3xl font-bold">58.2k</p>
          <p className="text-sm text-slate-500 mt-1">MW @ 5:00 PM</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Forecast vs Actual - Today</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockForecastData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(v: number) => [`${(v/1000).toFixed(1)}k MW`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Forecast"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  name="Actual"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-400">Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400">Actual</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Historical MAPE
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalMape}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 4]} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(v: number) => [`${v.toFixed(1)}%`, 'MAPE']}
                />
                <Area 
                  type="monotone" 
                  dataKey="mape" 
                  fill="#10b981"
                  fillOpacity={0.3}
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            6-month rolling average: <span className="text-green-400">2.1%</span>
          </p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4">Zone-Level Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Zone</th>
                <th className="pb-3">Current Load</th>
                <th className="pb-3">Forecast</th>
                <th className="pb-3">Error</th>
                <th className="pb-3">MAPE</th>
                <th className="pb-3">Peak Capacity</th>
                <th className="pb-3">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {zoneLoads.map((zone) => {
                const error = ((zone.load - zone.forecast) / zone.forecast * 100);
                const utilization = (zone.load / zone.peak * 100);
                return (
                  <tr key={zone.zone} className="border-b border-slate-700/50">
                    <td className="py-3 font-medium">{zone.zone}</td>
                    <td className="py-3">{zone.load.toLocaleString()} MW</td>
                    <td className="py-3">{zone.forecast.toLocaleString()} MW</td>
                    <td className={`py-3 ${error > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {error > 0 ? '+' : ''}{error.toFixed(1)}%
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        zone.mape < 2 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {zone.mape.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{zone.peak.toLocaleString()} MW</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${utilization > 85 ? 'bg-red-500' : utilization > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <span className="text-sm">{utilization.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400">Forecast Model Performance</h4>
            <p className="text-sm text-slate-400 mt-1">
              Using gradient boosted ensemble model trained on 3 years of ERCOT load data. 
              Model incorporates temperature, day-of-week, holiday, and economic indicators.
              Current 7-day rolling MAPE: <span className="text-green-400 font-semibold">1.8%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
