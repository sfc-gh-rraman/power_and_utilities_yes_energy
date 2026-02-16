import React, { useState } from 'react';
import { 
  Cloud, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertTriangle,
  Sun,
  Snowflake,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Bar
} from 'recharts';

const forecastDays = [
  { day: 'Mon', high: 98, low: 74, cdd: 33, hdd: 0, precip: 0, wind: 8, loadImpact: 4.2 },
  { day: 'Tue', high: 101, low: 76, cdd: 36, hdd: 0, precip: 10, wind: 12, loadImpact: 5.8 },
  { day: 'Wed', high: 103, low: 78, cdd: 38, hdd: 0, precip: 0, wind: 6, loadImpact: 7.1 },
  { day: 'Thu', high: 104, low: 79, cdd: 39, hdd: 0, precip: 0, wind: 5, loadImpact: 7.8 },
  { day: 'Fri', high: 102, low: 77, cdd: 37, hdd: 0, precip: 20, wind: 15, loadImpact: 6.2 },
  { day: 'Sat', high: 99, low: 75, cdd: 34, hdd: 0, precip: 30, wind: 18, loadImpact: 4.5 },
  { day: 'Sun', high: 96, low: 72, cdd: 31, hdd: 0, precip: 15, wind: 10, loadImpact: 3.1 },
];

const zoneWeather = [
  { zone: 'Houston', temp: 98, humidity: 72, heatIndex: 108, risk: 'HIGH', cdd: 33 },
  { zone: 'Dallas/North', temp: 101, humidity: 45, heatIndex: 106, risk: 'HIGH', cdd: 36 },
  { zone: 'San Antonio/South', temp: 99, humidity: 55, heatIndex: 107, risk: 'HIGH', cdd: 34 },
  { zone: 'West Texas', temp: 104, humidity: 20, heatIndex: 103, risk: 'ELEVATED', cdd: 39 },
];

const extremeEvents = [
  { event: 'Winter Storm Uri', date: 'Feb 2021', impact: 'Critical', loadDelta: -30000, priceMax: 9000 },
  { event: 'Summer 2023 Heat Wave', date: 'Aug 2023', impact: 'High', loadDelta: 8500, priceMax: 5000 },
  { event: 'May 2024 Storms', date: 'May 2024', impact: 'Moderate', loadDelta: -4200, priceMax: 800 },
];

const riskColors: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ELEVATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function WeatherRisk() {
  const maxTemp = Math.max(...forecastDays.map(d => d.high));
  const totalCdd = forecastDays.reduce((sum, d) => sum + d.cdd, 0);
  const maxLoadImpact = Math.max(...forecastDays.map(d => d.loadImpact));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Risk</h1>
          <p className="text-slate-400 mt-1">Weather impact analysis and extreme event risk scoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Data Source:</span>
          <span className="text-sm text-blue-400">NOAA / NWS</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-xl p-5 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Max Forecast</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{maxTemp}°F</p>
          <p className="text-sm text-slate-500 mt-1">Thursday peak</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">7-Day CDD</span>
          </div>
          <p className="text-3xl font-bold">{totalCdd}</p>
          <p className="text-sm text-slate-500 mt-1">Cooling degree days</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-slate-400">Peak Load Impact</span>
          </div>
          <p className="text-3xl font-bold">+{maxLoadImpact.toFixed(1)}%</p>
          <p className="text-sm text-slate-500 mt-1">vs normal</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">Risk Level</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">HIGH</p>
          <p className="text-sm text-slate-500 mt-1">Heat advisory</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">7-Day Temperature & Load Impact</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastDays}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="temp" stroke="#ef4444" fontSize={10} domain={[60, 110]} />
                <YAxis yAxisId="impact" orientation="right" stroke="#3b82f6" fontSize={10} domain={[0, 10]} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Area 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="high" 
                  fill="#ef4444" 
                  fillOpacity={0.2}
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="High Temp (°F)"
                />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="low" 
                  stroke="#60a5fa" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Low Temp (°F)"
                />
                <Bar 
                  yAxisId="impact"
                  dataKey="loadImpact" 
                  fill="#3b82f6" 
                  fillOpacity={0.5}
                  name="Load Impact (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-400">High Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-400" style={{ width: 12 }} />
              <span className="text-slate-400">Low Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500/50" />
              <span className="text-slate-400">Load Impact</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-400" />
            Zone Conditions
          </h3>
          <div className="space-y-3">
            {zoneWeather.map((zone, i) => (
              <div key={i} className="p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{zone.zone}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${riskColors[zone.risk]}`}>
                    {zone.risk}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Temp</p>
                    <p className="font-semibold">{zone.temp}°F</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Heat Index</p>
                    <p className="font-semibold text-orange-400">{zone.heatIndex}°F</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Humidity</p>
                    <p className="font-semibold">{zone.humidity}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Historical Extreme Events
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {extremeEvents.map((event, i) => (
            <div 
              key={i} 
              className={`p-4 rounded-lg border ${
                event.impact === 'Critical' ? 'bg-red-500/10 border-red-500/30' :
                event.impact === 'High' ? 'bg-orange-500/10 border-orange-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {event.event.includes('Winter') ? <Snowflake className="w-5 h-5 text-blue-400" /> :
                 event.event.includes('Heat') ? <Sun className="w-5 h-5 text-orange-400" /> :
                 <Cloud className="w-5 h-5 text-slate-400" />}
                <span className="font-semibold">{event.event}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{event.date}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Load Delta</p>
                  <p className={`font-semibold ${event.loadDelta > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {event.loadDelta > 0 ? '+' : ''}{(event.loadDelta / 1000).toFixed(1)}k MW
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Max Price</p>
                  <p className="font-semibold text-yellow-400">${event.priceMax.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-orange-400 mt-1" />
          <div>
            <h4 className="font-semibold text-orange-400">Heat Wave Advisory: Thursday Peak Risk</h4>
            <p className="text-sm text-slate-400 mt-1">
              Models predict <span className="text-white font-semibold">104°F in West Texas</span> on Thursday, 
              driving expected system load to <span className="text-orange-400 font-semibold">74,500 MW</span> (+7.8% above normal).
              4CP probability elevated. Consider activating demand response resources during 3-7 PM CT window.
              Wind generation forecast: <span className="text-blue-400">weak (5-8 mph)</span> - limited cooling contribution expected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
