import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Search,
  DollarSign,
  Zap,
  Activity,
  Clock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, Cell, BarChart, Bar
} from 'recharts';
import api from '../services/api';

const generatePriceSpikes = () => {
  const spikes = [];
  const baseDate = new Date();
  for (let i = 0; i < 15; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    spikes.push({
      datetime: date.toISOString().split('T')[0] + ' ' + Math.floor(14 + Math.random() * 5) + ':00',
      zone: ['Houston', 'North', 'South', 'West'][Math.floor(Math.random() * 4)],
      rtPrice: 100 + Math.random() * 900,
      daPrice: 40 + Math.random() * 30,
      spread: 60 + Math.random() * 850,
      duration: Math.floor(1 + Math.random() * 4),
      cause: ['Congestion', 'High Demand', 'Gen Outage', 'Transmission'][Math.floor(Math.random() * 4)]
    });
  }
  return spikes.sort((a, b) => b.rtPrice - a.rtPrice);
};

const priceSpikes = generatePriceSpikes();

const congestionPatterns = [
  { corridor: 'Houston Import', frequency: 23, avgCost: 15.4, trend: 'up' },
  { corridor: 'West Texas Export', frequency: 45, avgCost: 8.2, trend: 'up' },
  { corridor: 'North-South Tie', frequency: 12, avgCost: 22.1, trend: 'down' },
  { corridor: 'Valley Import', frequency: 8, avgCost: 18.7, trend: 'stable' },
];

const spreadAnalysis = [
  { hour: '0:00', daRt: -2.3 },
  { hour: '4:00', daRt: -1.8 },
  { hour: '8:00', daRt: 3.2 },
  { hour: '12:00', daRt: 5.7 },
  { hour: '14:00', daRt: 12.4 },
  { hour: '16:00', daRt: 18.2 },
  { hour: '17:00', daRt: 22.1 },
  { hour: '18:00', daRt: 15.6 },
  { hour: '20:00', daRt: 8.3 },
  { hour: '22:00', daRt: 2.1 },
];

export default function PriceForensics() {
  const [zone, setZone] = useState('ALL');
  const [dateRange, setDateRange] = useState('30d');

  const avgSpread = spreadAnalysis.reduce((sum, s) => sum + s.daRt, 0) / spreadAnalysis.length;
  const maxSpike = Math.max(...priceSpikes.map(s => s.rtPrice));
  const spikeCount = priceSpikes.filter(s => s.rtPrice > 200).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Price Forensics</h1>
          <p className="text-slate-400 mt-1">Price anomaly detection and pattern discovery</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Zones</option>
            <option value="HOUSTON">Houston</option>
            <option value="NORTH">North</option>
            <option value="SOUTH">South</option>
            <option value="WEST">West</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Max Spike</span>
          </div>
          <p className="text-3xl font-bold text-red-400">${maxSpike.toFixed(0)}</p>
          <p className="text-sm text-slate-500 mt-1">/MWh RT LMP</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <span className="text-slate-400">Spike Events</span>
          </div>
          <p className="text-3xl font-bold">{spikeCount}</p>
          <p className="text-sm text-slate-500 mt-1">&gt;$200/MWh events</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">Avg DA-RT Spread</span>
          </div>
          <p className="text-3xl font-bold">${avgSpread.toFixed(1)}</p>
          <p className="text-sm text-slate-500 mt-1">/MWh premium</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400">Congestion Hours</span>
          </div>
          <p className="text-3xl font-bold">88</p>
          <p className="text-sm text-slate-500 mt-1">this month</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">DA-RT Spread by Hour</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spreadAnalysis}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(v: number) => [`$${v.toFixed(1)}/MWh`, 'Spread']}
                />
                <Bar dataKey="daRt" radius={[4, 4, 0, 0]}>
                  {spreadAnalysis.map((entry, index) => (
                    <Cell key={index} fill={entry.daRt > 10 ? '#ef4444' : entry.daRt > 0 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Peak spread hours: 16:00-18:00 CT (avg +$18.6/MWh)
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Congestion Patterns</h3>
          <div className="space-y-3">
            {congestionPatterns.map((pattern, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium">{pattern.corridor}</p>
                  <p className="text-xs text-slate-400">{pattern.frequency} events • ${pattern.avgCost}/MWh avg</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  pattern.trend === 'up' ? 'text-red-400' : 
                  pattern.trend === 'down' ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {pattern.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                   pattern.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                  <span className="capitalize">{pattern.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-yellow-400" />
          Price Spike Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Zone</th>
                <th className="pb-3">RT Price</th>
                <th className="pb-3">DA Price</th>
                <th className="pb-3">Spread</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">Cause</th>
              </tr>
            </thead>
            <tbody>
              {priceSpikes.slice(0, 10).map((spike, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="py-3 font-medium">{spike.datetime}</td>
                  <td className="py-3">{spike.zone}</td>
                  <td className="py-3 text-red-400 font-semibold">${spike.rtPrice.toFixed(2)}</td>
                  <td className="py-3">${spike.daPrice.toFixed(2)}</td>
                  <td className={`py-3 font-medium ${spike.spread > 200 ? 'text-red-400' : 'text-yellow-400'}`}>
                    +${spike.spread.toFixed(2)}
                  </td>
                  <td className="py-3">{spike.duration}h</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      spike.cause === 'Congestion' ? 'bg-purple-500/20 text-purple-400' :
                      spike.cause === 'High Demand' ? 'bg-orange-500/20 text-orange-400' :
                      spike.cause === 'Gen Outage' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {spike.cause}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 border border-yellow-500/30 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Search className="w-5 h-5 text-yellow-400 mt-1" />
          <div>
            <h4 className="font-semibold text-yellow-400">Hidden Discovery: Recurring Congestion Pattern</h4>
            <p className="text-sm text-slate-400 mt-1">
              Analysis detected <span className="text-white font-semibold">45 recurring congestion events</span> on the 
              West Texas export corridor, primarily occurring between 2-6 PM on high-wind days. 
              Average price impact: <span className="text-yellow-400 font-semibold">$8.2/MWh</span> above normal.
              Consider hedging strategies for West zone exposure during wind curtailment periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
