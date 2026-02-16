import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Cloud,
  Cpu,
  Zap,
  Gauge,
  Activity,
  DollarSign
} from 'lucide-react';

import Landing from './pages/Landing';
import MissionControl from './pages/MissionControl';
import GridMap from './pages/GridMap';
import LoadAnalysis from './pages/LoadAnalysis';
import PriceForensics from './pages/PriceForensics';
import MorningBrief from './pages/MorningBrief';
import WeatherRisk from './pages/WeatherRisk';
import KnowledgeBase from './pages/KnowledgeBase';
import PeakPredictor from './pages/PeakPredictor';
import EventDispatch from './pages/EventDispatch';
import RevenueRisk from './pages/RevenueRisk';

const queryClient = new QueryClient();

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Mission Control' },
  { path: '/peak', icon: Gauge, label: '4CP Predictor' },
  { path: '/dispatch', icon: Zap, label: 'Event Dispatch' },
  { path: '/risk', icon: DollarSign, label: 'Revenue Risk' },
  { path: '/grid', icon: Map, label: 'Grid Map' },
  { path: '/load', icon: TrendingUp, label: 'Load Analysis' },
  { path: '/prices', icon: AlertTriangle, label: 'Price Forensics' },
  { path: '/weather', icon: Cloud, label: 'Weather Risk' },
  { path: '/brief', icon: FileText, label: 'Morning Brief' },
  { path: '/knowledge', icon: Cpu, label: 'Knowledge Base' },
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="fixed top-0 left-0 h-screen w-64 bg-slate-800 border-r border-slate-700 p-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 mb-8 px-2 hover:opacity-80 transition-opacity cursor-pointer w-full text-left"
        >
          <Zap className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-lg font-bold">Power & Utilities</h1>
            <p className="text-xs text-slate-400">Intelligence Platform</p>
          </div>
        </button>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-700/50 rounded-lg">
          <p className="text-xs text-slate-400">ERCOT Market</p>
          <p className="text-sm font-medium text-green-400">● Connected</p>
        </div>
      </nav>

      <main className="ml-64 p-6 min-h-screen bg-slate-900">
        {children}
      </main>
    </div>
  );
}

function LandingWrapper() {
  const navigate = useNavigate();
  return <Landing onNavigate={(page) => navigate(page === '/' ? '/dashboard' : page)} />;
}

function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <LandingWrapper />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<MissionControl />} />
        <Route path="/peak" element={<PeakPredictor />} />
        <Route path="/dispatch" element={<EventDispatch />} />
        <Route path="/risk" element={<RevenueRisk />} />
        <Route path="/grid" element={<GridMap />} />
        <Route path="/load" element={<LoadAnalysis />} />
        <Route path="/prices" element={<PriceForensics />} />
        <Route path="/weather" element={<WeatherRisk />} />
        <Route path="/brief" element={<MorningBrief />} />
        <Route path="/knowledge" element={<KnowledgeBase />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
