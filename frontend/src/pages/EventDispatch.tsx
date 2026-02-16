import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Clock,
  Flame,
  Snowflake,
  Wind,
  Sun
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

const scenarioIcons: Record<string, React.ComponentType<any>> = {
  'winter_storm_uri': Snowflake,
  'summer_peak_2023': Sun,
  'gas_supply_disruption': Flame,
  'renewable_curtailment': Wind,
  'moderate_peak': Zap
};

const scenarioColors: Record<string, string> = {
  'winter_storm_uri': '#ef4444',
  'summer_peak_2023': '#f97316',
  'gas_supply_disruption': '#eab308',
  'renewable_curtailment': '#22c55e',
  'moderate_peak': '#3b82f6'
};

function ScenarioCard({ 
  scenario, 
  onSimulate,
  isSelected 
}: { 
  scenario: any; 
  onSimulate: () => void;
  isSelected: boolean;
}) {
  const Icon = scenarioIcons[scenario.key] || Zap;
  const color = scenarioColors[scenario.key] || '#3b82f6';
  
  return (
    <div 
      onClick={onSimulate}
      className={`bg-slate-800 rounded-xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <span className="text-xs text-slate-500">{scenario.duration_hours}h</span>
      </div>
      <h3 className="font-semibold mb-1">{scenario.name}</h3>
      <p className="text-sm text-slate-400 mb-3">{scenario.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold" style={{ color }}>
          ${scenario.price_level.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500">/MWh</span>
      </div>
    </div>
  );
}

function ResultsPanel({ result, capacityMw }: { result: any; capacityMw: number }) {
  if (!result) return null;
  
  const savings = result.total_savings || 0;
  const savingsPerMw = savings / capacityMw;
  
  return (
    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-400" />
        Simulation Results: {result.scenario}
      </h3>
      
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-slate-400 text-sm">Total Potential Savings</p>
          <p className="text-3xl font-bold text-green-400">
            ${(savings / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Savings per MW</p>
          <p className="text-2xl font-bold">
            ${savingsPerMw.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Total Energy</p>
          <p className="text-2xl font-bold">
            {result.total_mwh?.toLocaleString()} MWh
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400">Base Price</p>
          <p className="font-semibold">${result.base_price?.toFixed(2)}/MWh</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400">Stress Price</p>
          <p className="font-semibold text-red-400">${result.stress_price?.toLocaleString()}/MWh</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400">Duration</p>
          <p className="font-semibold">{result.duration_hours} hours</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-slate-400">Capacity</p>
          <p className="font-semibold">{result.capacity_mw} MW</p>
        </div>
      </div>
    </div>
  );
}

export default function EventDispatch() {
  const [capacityMw, setCapacityMw] = useState(100);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [zone, setZone] = useState('HOUSTON');

  const { data: scenarios } = useQuery({
    queryKey: ['dispatch-scenarios'],
    queryFn: () => api.get('/api/dispatch/scenarios').then(r => r.data)
  });

  const { data: allResults } = useQuery({
    queryKey: ['dispatch-all', capacityMw, zone],
    queryFn: () => api.get(`/api/dispatch/simulate-all?capacity_mw=${capacityMw}&zone=${zone}`).then(r => r.data)
  });

  const { data: simulationResult, refetch: runSimulation } = useQuery({
    queryKey: ['dispatch-simulate', selectedScenario, capacityMw, zone],
    queryFn: () => api.get(`/api/dispatch/simulate/${selectedScenario}?capacity_mw=${capacityMw}&zone=${zone}`).then(r => r.data),
    enabled: !!selectedScenario
  });

  const { data: historicalEvents } = useQuery({
    queryKey: ['historical-events', zone],
    queryFn: () => api.get(`/api/dispatch/historical-events?threshold_price=500&zone=${zone}`).then(r => r.data)
  });

  const chartData = allResults?.scenarios?.map((s: any) => ({
    name: s.scenario?.split(' ')[0] || 'Unknown',
    savings: (s.total_savings || 0) / 1000000,
    key: s.scenario_key
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Dispatch Simulator</h1>
          <p className="text-slate-400 mt-1">Stress test DR capacity across historical scenarios</p>
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
            <label className="text-sm text-slate-400 mr-2">Capacity</label>
            <input
              type="number"
              value={capacityMw}
              onChange={(e) => setCapacityMw(Number(e.target.value))}
              className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-slate-400 ml-1">MW</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Total Potential Value</span>
          </div>
          <p className="text-3xl font-bold text-green-400">
            ${((allResults?.total_potential_savings || 0) / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-slate-500 mt-1">Across all scenarios</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">Base Price</span>
          </div>
          <p className="text-3xl font-bold">
            ${allResults?.base_price?.toFixed(2) || '--'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Average RT LMP</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-slate-400">Historical Spikes</span>
          </div>
          <p className="text-3xl font-bold">
            {historicalEvents?.event_count || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">Events &gt;$500/MWh in 2025</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4">Scenario Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v}M`} />
              <YAxis type="category" dataKey="name" stroke="#64748b" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                formatter={(v: number) => [`$${v.toFixed(2)}M`, 'Savings']}
              />
              <Bar dataKey="savings" radius={[0, 4, 4, 0]}>
                {chartData.map((entry: any, index: number) => (
                  <Cell key={index} fill={scenarioColors[entry.key] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Select Scenario to Simulate</h3>
        <div className="grid grid-cols-5 gap-4">
          {scenarios?.scenarios?.map((scenario: any) => (
            <ScenarioCard
              key={scenario.key}
              scenario={scenario}
              onSimulate={() => setSelectedScenario(scenario.key)}
              isSelected={selectedScenario === scenario.key}
            />
          ))}
        </div>
      </div>

      {simulationResult && (
        <ResultsPanel result={simulationResult} capacityMw={capacityMw} />
      )}

      {historicalEvents?.events && historicalEvents.events.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Price Spikes ({zone})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">RT Price</th>
                  <th className="pb-3">DA Price</th>
                  <th className="pb-3">Spread</th>
                </tr>
              </thead>
              <tbody>
                {historicalEvents.events.slice(0, 10).map((event: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td className="py-3 font-medium">{event.datetime}</td>
                    <td className="py-3 text-red-400 font-semibold">${event.rt_price?.toFixed(2)}</td>
                    <td className="py-3">${event.da_price?.toFixed(2)}</td>
                    <td className={`py-3 font-medium ${event.spread > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ${event.spread?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
