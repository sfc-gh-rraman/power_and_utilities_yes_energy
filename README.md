# Power & Utilities Intelligence Platform

## ERCOT Market Analytics with Multi-Agent AI

A comprehensive analytics platform for ERCOT electricity market monitoring, load forecasting, and price analysis. Built following the ATLAS (Construction Capital Delivery) architecture patterns.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                               │
│   Mission Control │ Grid Map │ Load Analysis │ Price Forensics      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Agent Orchestrator                              │   │
│  │   Load Agent │ Price Agent │ Weather Agent │ Search Agent   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Snowflake                                     │
│  ATOMIC Tables │ ML Registry │ Analytics Views │ Cortex Search      │
│  YES_ENERGY_FOUNDATION_DATA │ RTO_INSIDER_DOCS                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Sources

### YES_ENERGY_FOUNDATION_DATA (75 views)
Real production ERCOT market data:
- **Prices**: DART_PRICES, RT15_PRICES, TS_LMP_BUS_PRICE_ERCOT
- **Load**: TS_LOAD, DART_LOADS, RT_LOADS
- **Generation**: TS_GEN, ERCOT_60D_SCED_GEN_RESOURCE_DATA_RAW
- **Weather**: ALL_WEATHER_MV, WX_FORECASTS
- **Fuel**: TS_FUEL_PRICES_V

### RTO_INSIDER_DOCS (1,000 articles)
RTO market news for knowledge base with Cortex Search.

## ML Models

### Load Forecaster (Physics-XGBoost)
- **MAPE**: ~1.00%
- **Features**: CDD, HDD, Wind Chill, Thermal Inertia, Cumulative Temp
- **Algorithm**: XGBoost with physics-based feature engineering

### Physics Features
```python
df['CDD'] = np.where(df['TAVG'] > 65, df['TAVG'] - 65, 0)
df['HDD'] = np.where(df['TAVG'] < 65, 65 - df['TAVG'], 0)
df['WIND_CHILL'] = 35.74 + 0.6215*T - 35.75*W^0.16 + 0.4275*T*W^0.16
df['THERMAL_INERTIA'] = df['TAVG'].ewm(span=5).mean()
df['CUMULATIVE_TEMP'] = df['TAVG'].rolling(window=7).sum()
```

## Pages

1. **Mission Control** - Real-time KPIs, AI chat, alerts
2. **Grid Map** - Geographic view with zone status
3. **Load Analysis** - Forecast vs actual, MAPE tracking
4. **Price Forensics** - Spike analysis, Hidden Discovery
5. **Weather Risk** - CDD/HDD tracking, extreme events
6. **Morning Brief** - AI-generated daily summary
7. **Knowledge Base** - Cortex Search over RTO news

## Hidden Discovery

Detect systemic patterns across the ERCOT market:
- **Weather-Price Correlation**: Humidity impact on Houston prices
- **Congestion Patterns**: West-to-Houston evening corridor
- **Demand Surges**: Data center load causing forecast errors

## Setup

### Database
```sql
-- Run DDL scripts in order
001_database.sql
002_atomic_tables.sql
003_ml_tables.sql
004_datamart_views.sql
005_data_ingestion.sql
006_cortex_search.sql
```

### Backend
```bash
cd backend
pip install -r requirements.txt
SNOWFLAKE_CONNECTION_NAME=demo uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## ERCOT Zones

| Zone | Population | Peak Load | Key Characteristics |
|------|------------|-----------|---------------------|
| HOUSTON | 7M | 22 GW | Humidity-driven demand, refinery load |
| NORTH | 8M | 25 GW | DFW metro, data centers |
| SOUTH | 3.5M | 12 GW | San Antonio, border load |
| WEST | 1.5M | 8 GW | Wind generation, oil field load |

## API Endpoints

- `GET /api/grid/status` - Real-time grid status
- `GET /api/load/{zone}` - Load data by zone
- `GET /api/prices/{zone}` - LMP prices by zone
- `GET /api/weather/{zone}` - Weather data by zone
- `POST /api/chat` - Multi-agent AI chat
- `POST /api/search` - Knowledge base search
- `GET /api/models` - ML model performance
- `GET /api/patterns` - Hidden pattern alerts
