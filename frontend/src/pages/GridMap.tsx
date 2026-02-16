import React from 'react';
import { MapPin, Zap, DollarSign, Thermometer } from 'lucide-react';

const zones = [
  { code: 'HOUSTON', name: 'Houston Zone', lat: 29.76, lng: -95.37, load: 18500, price: 42.5, temp: 78, status: 'normal' },
  { code: 'NORTH', name: 'North Zone', lat: 32.78, lng: -96.80, load: 21200, price: 38.2, temp: 72, status: 'normal' },
  { code: 'SOUTH', name: 'South Zone', lat: 29.42, lng: -98.49, load: 9800, price: 45.8, temp: 82, status: 'elevated' },
  { code: 'WEST', name: 'West Zone', lat: 31.97, lng: -99.90, load: 6200, price: 35.1, temp: 88, status: 'normal' },
];

const statusColors = {
  normal: 'bg-green-500',
  elevated: 'bg-yellow-500',
  high: 'bg-red-500',
};

export default function GridMap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ERCOT Grid Map</h1>
        <p className="text-slate-400 mt-1">Geographic view of load zones and real-time status</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 min-h-[500px] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 400 300" className="w-full h-full max-w-2xl opacity-20">
              <path 
                d="M50,50 L350,50 L350,250 L50,250 Z" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2"
              />
              <text x="200" y="150" textAnchor="middle" fill="#64748b" fontSize="24">TEXAS / ERCOT</text>
            </svg>
          </div>
          
          {zones.map((zone) => {
            const x = ((zone.lng + 106) / 12) * 100;
            const y = ((34 - zone.lat) / 8) * 100;
            
            return (
              <div
                key={zone.code}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-4 h-4 rounded-full ${statusColors[zone.status as keyof typeof statusColors]} animate-pulse`} />
                
                <div className="absolute left-6 top-0 bg-slate-900 border border-slate-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                  <h3 className="font-semibold text-sm">{zone.name}</h3>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span>{zone.load.toLocaleString()} MW</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      <span>${zone.price}/MWh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-orange-400" />
                      <span>{zone.temp}°F</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="absolute bottom-4 left-4 bg-slate-900/80 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2">Status Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Elevated</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>High Risk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Zone Summary</h2>
          {zones.map((zone) => (
            <div key={zone.code} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{zone.name}</h3>
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[zone.status as keyof typeof statusColors]}`} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Load</p>
                  <p className="font-medium">{(zone.load / 1000).toFixed(1)}k MW</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Price</p>
                  <p className="font-medium">${zone.price}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Temp</p>
                  <p className="font-medium">{zone.temp}°F</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
