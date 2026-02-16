export interface LoadZone {
  zoneId: number;
  zoneCode: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  populationServed: number;
  peakLoadMw: number;
  isActive: boolean;
}

export interface HourlyLoad {
  zoneCode: string;
  datetimeUtc: string;
  loadMw: number;
  loadForecastMw?: number;
  forecastErrorPct?: number;
}

export interface HourlyLmp {
  zoneCode: string;
  nodeName: string;
  datetimeUtc: string;
  daLmp: number;
  rtLmp: number;
  rtCongestion: number;
  isPriceSpike: boolean;
}

export interface WeatherData {
  zoneCode: string;
  datetimeUtc: string;
  tempF: number;
  windSpeedMph: number;
  cdd: number;
  hdd: number;
  isExtremeWeather: boolean;
}

export interface PriceAnomalyEvent {
  eventId: number;
  eventType: string;
  zoneCode: string;
  eventStart: string;
  eventEnd?: string;
  durationHours: number;
  peakPrice: number;
  avgPrice: number;
  probableCause?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface HiddenPattern {
  patternId: number;
  patternType: string;
  patternName: string;
  description: string;
  discoveryDate: string;
  affectedZones: string[];
  occurrenceCount: number;
  avgPriceImpact: number;
  totalCostImpact: number;
  confidenceScore: number;
  status: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ModelPerformance {
  modelId: number;
  modelName: string;
  modelVersion: string;
  modelType: string;
  mape: number;
  rmse: number;
  r2Score: number;
  isActive: boolean;
}

export interface GridStatus {
  zoneCode: string;
  zoneName: string;
  currentLoadMw: number;
  forecastedLoadMw: number;
  forecastErrorPct: number;
  currentRtLmp: number;
  currentDaLmp: number;
  congestionComponent: number;
  currentTempF: number;
  priceStatus: 'NORMAL' | 'ELEVATED' | 'HIGH';
  forecastStatus: 'NORMAL' | 'WARNING';
}

export interface MorningBriefData {
  zoneCode: string;
  zoneName: string;
  avgLoad: number;
  peakLoad: number;
  avgPrice: number;
  peakPrice: number;
  highPriceHours: number;
  weatherRisk: number;
  riskCategory: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}
