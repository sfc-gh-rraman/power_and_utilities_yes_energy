import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Gauge, 
  Thermometer, 
  Zap, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';

const historicalPeaks = [
  { year: 2024, month: 6, day: 26, hour: 17, load_mw: 74521 },
  { year: 2024, month: 7, day: 22, hour: 17, load_mw: 76234 },
  { year: 2024, month: 8, day: 20, hour: 17, load_mw: 77892 },
  { year: 2024, month: 9, day: 5, hour: 16, load_mw: 73156 },
  { year: 2023, month: 6, day: 27, hour: 17, load_mw: 72891 },
  { year: 2023, month: 7, day: 27, hour: 17, load_mw: 75432 },
  { year: 2023, month: 8, day: 10, hour: 17, load_mw: 85464 },
  { year: 2023, month: 9, day: 6, hour: 16, load_mw: 71234 },
];

function ProbabilityGauge({ probability, riskLevel }: { probability: number; riskLevel: string }) {
  const colors: Record<string, string> = {
    CRITICAL: 'text-red-500',
    HIGH: 'text-orange-500',
    ELEVATED: 'text-yellow-500',
    MODERATE: 'text-blue-400',
    LOW: 'text-green-500',
    NONE: 'text-slate-500'
  };

  const bgColors: Record<string, string> = {
    CRITICAL: 'from-red-500/20 to-red-600/10',
    HIGH: 'from-orange-500/20 to-orange-600/10',
    ELEVATED: 'from-yellow-500/20 to-yellow-600/10',
    MODERATE: 'from-blue-500/20 to-blue-600/10',
    LOW: 'from-green-500/20 to-green-600/10',
    NONE: 'from-slate-500/20 to-slate-600/10'
  };

  return (
    <div className={`bg-gradient-to-br ${bgColors[riskLevel]} rounded-2xl p-8 border border-slate-700`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gauge className={`w-8 h-8 ${colors[riskLevel]}`} />
          <div>
            <h2 className="text-xl font-bold">4CP Probability</h2>
            <p className="text-sm text-slate-400">Peak coincidence risk</p>
          </div>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${
          riskLevel === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-400' :
          riskLevel === 'HIGH' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
          riskLevel === 'ELEVATED' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
          'bg-green-500/20 border-green-500 text-green-400'
        }`}>
          {riskLevel}
        </span>
      </div>
      
      <div className="flex items-end gap-2 mb-4">
        <span className={`text-7xl font-bold ${colors[riskLevel]}`}>
          {(probability * 100).toFixed(0)}
        </span>
        <span className="text-3xl text-slate-400 mb-2">%</span>
      </div>
      
      <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            riskLevel === 'CRITICAL' ? 'bg-red-500' :
            riskLevel === 'HIGH' ? 'bg-orange-500' :
            riskLevel === 'ELEVATED' ? 'bg-yellow-500' :
            riskLevel === 'MODERATE' ? 'bg-blue-500' :
            'bg-green-500'
          }`}
          style={{ width: `${probability * 100}%` }}
        />
      </div>
    </div>
  );
}

function FactorCard({ label, value, impact }: { label: string; value: string; impact: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-sm text-blue-400 mt-1">{impact}</p>
    </div>
  );
}

export default function PeakPredictor() {
  const [loadMw, setLoadMw] = useState(70000);
  const [tempF, setTempF] = useState(95);
  const [hour, setHour] = useState(17);
  const [month, setMonth] = useState(8);
  const [capacityMw, setCapacityMw] = useState(100);

  const { data: prediction, refetch } = useQuery({
    queryKey: ['4cp-probability', loadMw, tempF, hour, month],
    queryFn: () => api.get(`/api/peak/probability?load_mw=${loadMw}&temp_f=${tempF}&hour=${hour}&month=${month}`).then(r => r.data),
    enabled: true
  });

  const { data: drValue } = useQuery({
    queryKey: ['dr-value', capacityMw, prediction?.probability],
    queryFn: () => api.get(`/api/peak/dr-value?capacity_mw=${capacityMw}&probability=${prediction?.probability || 0.5}`).then(r => r.data),
    enabled: !!prediction
  });

  const probability = prediction?.probability || 0;
  const riskLevel = prediction?.risk_level || 'LOW';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">4CP Peak Predictor</h1>
        <p className="text-slate-400 mt-1">Transmission cost peak coincidence probability</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ProbabilityGauge probability={probability} riskLevel={riskLevel} />
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            DR Value Calculator
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Capacity (MW)</label>
              <input
                type="number"
                value={capacityMw}
                onChange={(e) => setCapacityMw(Number(e.target.value))}
                className="w-full mt-1 bg-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {drValue && (
              <>
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">Expected Annual Savings</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${(drValue.expected_annual_savings / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Max Potential</p>
                  <p className="text-lg font-semibold">
                    ${(drValue.max_annual_savings / 1000).toFixed(0)}K
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-slate-400">System Load</span>
          </div>
          <input
            type="number"
            value={loadMw}
            onChange={(e) => setLoadMw(Number(e.target.value))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">MW</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-sm text-slate-400">Temperature</span>
          </div>
          <input
            type="number"
            value={tempF}
            onChange={(e) => setTempF(Number(e.target.value))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">°F</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-slate-400">Hour</span>
          </div>
          <select
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{i}:00</option>
            ))}
          </select>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-400">Month</span>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full bg-slate-700 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {prediction?.factors && Object.keys(prediction.factors).length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Contributing Factors</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(prediction.factors).map(([key, value]) => (
              <FactorCard 
                key={key} 
                label={key.replace('_', ' ').toUpperCase()} 
                value={String(value)}
                impact="Increases probability"
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Historical 4CP Events
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Year</th>
                <th className="pb-3">Month</th>
                <th className="pb-3">Day</th>
                <th className="pb-3">Hour</th>
                <th className="pb-3">System Peak (MW)</th>
              </tr>
            </thead>
            <tbody>
              {historicalPeaks.map((peak, i) => (
                <tr key={i} className="border-b border-slate-700/50">
                  <td className="py-3 font-medium">{peak.year}</td>
                  <td className="py-3">{['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][peak.month]}</td>
                  <td className="py-3">{peak.day}</td>
                  <td className="py-3">{peak.hour}:00</td>
                  <td className="py-3 font-semibold text-yellow-400">{peak.load_mw.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
