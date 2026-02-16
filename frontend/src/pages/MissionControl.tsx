import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Thermometer,
  Wind,
  DollarSign,
  Zap,
  MessageSquare,
  Send
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';

const mockGridStatus = [
  { zoneCode: 'HOUSTON', zoneName: 'Houston Zone', currentLoadMw: 18500, forecastedLoadMw: 18200, forecastErrorPct: 1.6, currentRtLmp: 42.5, priceStatus: 'NORMAL', currentTempF: 78 },
  { zoneCode: 'NORTH', zoneName: 'North Zone', currentLoadMw: 21200, forecastedLoadMw: 20800, forecastErrorPct: 1.9, currentRtLmp: 38.2, priceStatus: 'NORMAL', currentTempF: 72 },
  { zoneCode: 'SOUTH', zoneName: 'South Zone', currentLoadMw: 9800, forecastedLoadMw: 9600, forecastErrorPct: 2.1, currentRtLmp: 45.8, priceStatus: 'ELEVATED', currentTempF: 82 },
  { zoneCode: 'WEST', zoneName: 'West Zone', currentLoadMw: 6200, forecastedLoadMw: 6100, forecastErrorPct: 1.6, currentRtLmp: 35.1, priceStatus: 'NORMAL', currentTempF: 88 },
];

const mockLoadTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  load: 45000 + Math.sin(i / 3) * 8000 + Math.random() * 2000,
  forecast: 45000 + Math.sin(i / 3) * 8000,
}));

const mockAlerts = [
  { id: 1, severity: 'HIGH', message: 'Price spike detected in South zone - RT LMP exceeded $100/MWh', time: '14:32' },
  { id: 2, severity: 'MEDIUM', message: 'Load forecast deviation >5% in Houston zone', time: '14:15' },
  { id: 3, severity: 'LOW', message: 'Wind generation ramping down - West zone', time: '13:45' },
];

function KpiCard({ title, value, unit, icon: Icon, trend, trendValue, color = 'blue' }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {value}
            <span className="text-sm text-slate-400 ml-1">{unit}</span>
          </p>
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3 text-sm">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
            {trendValue}
          </span>
          <span className="text-slate-500 ml-1">vs yesterday</span>
        </div>
      )}
    </div>
  );
}

function ZoneStatusCard({ zone }: { zone: typeof mockGridStatus[0] }) {
  const statusColors = {
    NORMAL: 'bg-green-500',
    ELEVATED: 'bg-yellow-500',
    HIGH: 'bg-red-500',
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{zone.zoneName}</h3>
        <span className={`w-2.5 h-2.5 rounded-full ${statusColors[zone.priceStatus as keyof typeof statusColors]}`} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Load</p>
          <p className="font-medium">{zone.currentLoadMw.toLocaleString()} MW</p>
        </div>
        <div>
          <p className="text-slate-400">RT Price</p>
          <p className="font-medium">${zone.currentRtLmp.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400">Forecast Error</p>
          <p className={`font-medium ${zone.forecastErrorPct > 3 ? 'text-yellow-400' : 'text-green-400'}`}>
            {zone.forecastErrorPct}%
          </p>
        </div>
        <div>
          <p className="text-slate-400">Temperature</p>
          <p className="font-medium">{zone.currentTempF}°F</p>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: typeof mockAlerts[0] }) {
  const severityColors = {
    HIGH: 'border-red-500 bg-red-500/10',
    MEDIUM: 'border-yellow-500 bg-yellow-500/10',
    LOW: 'border-blue-500 bg-blue-500/10',
  };

  return (
    <div className={`p-3 rounded-lg border-l-4 ${severityColors[alert.severity as keyof typeof severityColors]}`}>
      <div className="flex items-start justify-between">
        <p className="text-sm">{alert.message}</p>
        <span className="text-xs text-slate-500 ml-2">{alert.time}</span>
      </div>
    </div>
  );
}

export default function MissionControl() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hello! I\'m your ERCOT market assistant. Ask me about load forecasts, prices, weather impacts, or market patterns.' }
  ]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Based on current conditions, ERCOT system load is at 55,700 MW with all zones operating normally. The South zone shows slightly elevated prices due to transmission congestion. Weather forecast indicates temperatures will remain above 80°F through the week, supporting continued high demand.`
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mission Control</h1>
          <p className="text-slate-400 mt-1">ERCOT Real-time Grid Monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-slate-400">Live</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard 
          title="System Load" 
          value="55,700" 
          unit="MW" 
          icon={Zap}
          trend="up"
          trendValue="+3.2%"
          color="blue"
        />
        <KpiCard 
          title="Avg RT Price" 
          value="40.4" 
          unit="$/MWh" 
          icon={DollarSign}
          trend="down"
          trendValue="-8.1%"
          color="green"
        />
        <KpiCard 
          title="Forecast MAPE" 
          value="1.8" 
          unit="%" 
          icon={Activity}
          color="yellow"
        />
        <KpiCard 
          title="Active Alerts" 
          value="3" 
          unit="" 
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h2 className="font-semibold mb-4">System Load - Last 24 Hours</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockLoadTrend}>
                <defs>
                  <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="load" stroke="#3b82f6" fill="url(#loadGradient)" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h2 className="font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {mockAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-semibold mb-4">Zone Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {mockGridStatus.map(zone => (
              <ZoneStatusCard key={zone.zoneCode} zone={zone} />
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">AI Assistant</h2>
            </div>
          </div>
          
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-64">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 ml-8' 
                  : 'bg-slate-700 mr-8'
              }`}>
                {msg.content}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask about the grid..."
                className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleChat}
                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
