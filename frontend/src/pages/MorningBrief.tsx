import React from 'react';
import { 
  Sun, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Zap,
  Thermometer,
  Wind,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const marketSummary = {
  avgRtPrice: 42.50,
  priceChange: -8.1,
  systemLoad: 55700,
  loadChange: 3.2,
  peakForecast: 58200,
  peakTime: '5:00 PM CT',
  forecastMape: 1.8,
};

const zoneHighlights = [
  { zone: 'Houston', price: 41.25, priceChange: -5.2, load: 18500, status: 'Normal' },
  { zone: 'North', price: 40.98, priceChange: -7.8, load: 21200, status: 'Normal' },
  { zone: 'South', price: 42.90, priceChange: -3.1, load: 9800, status: 'Elevated' },
  { zone: 'West', price: 51.65, priceChange: +12.4, load: 6200, status: 'Normal' },
];

const alerts = [
  { type: 'warning', message: 'South zone congestion expected 3-6 PM', time: '2 hours ago' },
  { type: 'info', message: 'Wind generation ramping up in West Texas', time: '4 hours ago' },
  { type: 'success', message: 'Load forecast within 2% MAPE target', time: '6 hours ago' },
];

const recommendations = [
  { action: 'Monitor South zone pricing', priority: 'high', reason: 'Congestion pattern developing' },
  { action: 'Review DR readiness for Thursday', priority: 'medium', reason: '104°F forecast, elevated 4CP risk' },
  { action: 'Check West zone hedges', priority: 'low', reason: 'Price volatility elevated (+12.4%)' },
];

export default function MorningBrief() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Morning Brief</h1>
          <p className="text-slate-400 mt-1">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Generated at 6:00 AM CT</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-400" />
          Executive Summary
        </h3>
        <p className="text-slate-300 leading-relaxed">
          ERCOT markets opened <span className="text-green-400 font-semibold">lower</span> this morning with average RT prices 
          at <span className="text-white font-semibold">${marketSummary.avgRtPrice}/MWh</span> (-8.1% vs yesterday). 
          System load is <span className="text-white font-semibold">{(marketSummary.systemLoad / 1000).toFixed(1)}k MW</span> (+3.2%), 
          tracking within forecast band. Peak expected at <span className="text-yellow-400 font-semibold">{(marketSummary.peakForecast / 1000).toFixed(1)}k MW</span> around {marketSummary.peakTime}.
          <span className="text-orange-400"> Watch South zone for afternoon congestion.</span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Avg RT Price</span>
          </div>
          <p className="text-2xl font-bold">${marketSummary.avgRtPrice}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${marketSummary.priceChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {marketSummary.priceChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
            {marketSummary.priceChange}% vs yesterday
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400">System Load</span>
          </div>
          <p className="text-2xl font-bold">{(marketSummary.systemLoad / 1000).toFixed(1)}k MW</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${marketSummary.loadChange > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
            <TrendingUp className="w-3 h-3" />
            +{marketSummary.loadChange}% vs yesterday
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-red-400" />
            <span className="text-slate-400">Peak Forecast</span>
          </div>
          <p className="text-2xl font-bold">{(marketSummary.peakForecast / 1000).toFixed(1)}k MW</p>
          <p className="text-sm text-slate-400 mt-1">{marketSummary.peakTime}</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-slate-400">Forecast MAPE</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{marketSummary.forecastMape}%</p>
          <p className="text-sm text-slate-400 mt-1">Within target</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Zone Highlights</h3>
          <div className="space-y-3">
            {zoneHighlights.map((zone, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    zone.status === 'Normal' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="font-medium">{zone.zone}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Price: </span>
                    <span className="font-semibold">${zone.price}</span>
                    <span className={`ml-1 ${zone.priceChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ({zone.priceChange > 0 ? '+' : ''}{zone.priceChange}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Load: </span>
                    <span className="font-semibold">{(zone.load / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" /> :
                   alert.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" /> :
                   <Wind className="w-4 h-4 text-blue-400 mt-0.5" />}
                  <div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
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
          Today's Recommendations
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className={`p-4 rounded-lg border ${
              rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
              rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
              'bg-slate-700/30 border-slate-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${
                  rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="font-medium mb-2">{rec.action}</p>
              <p className="text-xs text-slate-400">{rec.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <Wind className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-400">Weather Outlook</h4>
            <p className="text-sm text-slate-400 mt-1">
              Today: <span className="text-white">Partly cloudy, high 98°F</span> in Houston area. 
              Wind generation expected to be <span className="text-green-400">moderate (12-15 mph)</span> in West Texas.
              <span className="text-yellow-400"> Thursday heat wave approaching</span> - 104°F forecast for West Texas region. 
              Consider pre-positioning DR resources for potential 4CP event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
