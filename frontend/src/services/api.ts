const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: async (url: string) => {
    const data = await fetchApi<any>(url);
    return { data };
  },
  
  post: async (url: string, body: any) => {
    const data = await fetchApi<any>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data };
  },
  
  getGridStatus: () => fetchApi<any[]>('/api/grid/status'),
  
  getLoadByZone: (zoneCode: string, startDate?: string, endDate?: string) =>
    fetchApi<any[]>(`/api/load/${zoneCode}?start=${startDate}&end=${endDate}`),
  
  getPricesByZone: (zoneCode: string, startDate?: string, endDate?: string) =>
    fetchApi<any[]>(`/api/prices/${zoneCode}?start=${startDate}&end=${endDate}`),
  
  getWeatherByZone: (zoneCode: string) =>
    fetchApi<any[]>(`/api/weather/${zoneCode}`),
  
  getPriceAnomalies: (days?: number) =>
    fetchApi<any[]>(`/api/anomalies?days=${days || 7}`),
  
  getHiddenPatterns: () =>
    fetchApi<any[]>('/api/patterns'),
  
  getModelPerformance: () =>
    fetchApi<any[]>('/api/models'),
  
  getMorningBrief: () =>
    fetchApi<any>('/api/brief'),
  
  chat: (message: string, context?: string) =>
    fetchApi<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),
  
  searchKnowledge: (query: string) =>
    fetchApi<any[]>('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};

export default api;
