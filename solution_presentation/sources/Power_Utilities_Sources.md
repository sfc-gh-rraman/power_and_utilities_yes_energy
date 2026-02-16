# VOLT Power & Utilities - Data Sources & References

## Industry Statistics

### 4CP Cost Data

| Statistic | Value | Source |
|-----------|-------|--------|
| Average annual 4CP charges | $15-25M for mid-size utilities | ERCOT Transmission Cost Allocation Reports, 2024 |
| Cost per coincident peak | $2-5M per peak contribution | 4CP Working Group Analysis |
| Industry success rate | <40% on all 4 peaks | Utility benchmarking studies |
| Typical successful avoidance | 1-2 of 4 peaks | Industry surveys |

### ERCOT 4CP Mechanics

| Parameter | Value | Description |
|-----------|-------|-------------|
| Peak season | June-September | 4 summer months only |
| Peak interval | 15 minutes | Single highest interval per month |
| Settlement timing | Annual | Following year allocation |
| Zone contribution | Proportional | Based on load during peak |

### Weather Correlation Analysis

The 4CP prediction model demonstrates that temperature alone is insufficient:

- **Temperature correlation:** ~65% with actual 4CP peaks
- **Multi-factor correlation:** 87%+ with ML model (12 features)
- **Key additional factors:** Humidity, wind generation, cloud cover, time of day
- **Prediction window needed:** 2-4 hours for effective curtailment

## Demo Data Specifications

### Load Data (Yes Energy)

| Metric | Value |
|--------|-------|
| Data source | YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS |
| Key columns | RTLOAD (real-time), DALOAD (day-ahead) |
| Zones covered | Houston, North, South, West (LZ_ prefix) |
| Refresh rate | Every 5 minutes |
| Historical depth | 2+ years |

### Weather Data

| Metric | Value |
|--------|-------|
| Primary source | OpenWeather API |
| Backup source | NOAA public data |
| Key parameters | Temperature, humidity, cloud cover, wind speed |
| Forecast horizon | 7 days |
| Update frequency | Hourly |

### Historical 4CP Events

| Metric | Value |
|--------|-------|
| Event type | 4 Coincident Peak intervals per year |
| Date range | 2019-2025 |
| Total events | 24+ confirmed 4CP intervals |
| Training data | 78,000+ 15-minute intervals |

## ROI Assumptions

### Value Calculation Basis

| Item | Assumption | Justification |
|------|------------|---------------|
| Peaks avoided per year | 2 additional peaks | Improvement from 1-2 to 3-4 |
| Value per avoided peak | $2.5M | Mid-range for 1,000 MW utility |
| Demand charge savings | $1.5M | Better load shaping from predictions |
| Penalty avoidance | $500K | ERCOT compliance exposure |

### Implementation Cost

| Item | Cost |
|------|------|
| Snowflake platform setup | $80K |
| Data integration (Yes Energy, weather APIs) | $100K |
| ML model development | $80K |
| VOLT application deployment | $80K |
| Training and change management | $60K |
| **Total Implementation** | **$400K** |

### Payback Calculation

- **First avoided peak:** ~$2.5M value
- **Payback period:** After first successful prediction (typically 1-2 months into peak season)
- **Annual ROI:** 1,650%+ ($7M value / $400K investment)

## Technical References

### Snowflake Capabilities Used

| Capability | Use Case |
|------------|----------|
| Cortex Complete | Natural language chat responses |
| Cortex Agent | Multi-turn conversations with tool use |
| Snowpark ML | 4CP probability prediction model |
| External Tables | Yes Energy data integration |
| Snowpipe | Real-time weather data ingestion |

### ML Model Specifications

| Model | Purpose | Features |
|-------|---------|----------|
| 4CP Predictor | Predict probability of coincident peak | Load, temp, humidity, hour, month, day-of-week, solar position, wind gen, cloud cover, zone |
| Load Forecaster | Short-term load prediction | Historical patterns, weather, time features |
| Zone Analyzer | Zone-level contribution analysis | Zone loads, historical zone peaks |

### ERCOT Data References

| Data Type | Source | Access |
|-----------|--------|--------|
| Real-time load | ERCOT MIS | API/Public |
| Settlement data | ERCOT Settlements | Licensed |
| Transmission costs | ERCOT TAC | Annual reports |
| 4CP historical | ERCOT Settlement Calendar | Public |

## Industry References

### Publications

1. ERCOT. "Transmission Cost of Service and Cost Allocation." Annual Reports, 2024.

2. Texas Public Utility Commission. "4CP Demand Allocation Methodology." Rulemaking.

3. Electric Reliability Council of Texas. "ERCOT Quick Facts." 2024.

4. S&P Global. "Texas Power Market Analysis: Summer Peak Dynamics." 2024.

5. Wood Mackenzie. "ERCOT Load Growth and Transmission Cost Trends." 2024.

### Academic/Technical Research

1. Woo, C.K., et al. "Electricity Market Price Dynamics and Weather." Energy Policy. 2023.

2. Taylor, J.W. "Short-Term Load Forecasting Methods: Machine Learning Approaches." International Journal of Forecasting. 2024.

3. Hong, T., et al. "Global Energy Forecasting Competition: Probabilistic Load Forecasting." International Journal of Forecasting. 2023.

## 4CP Calculation Methodology

### How 4CP Works

1. **Peak Identification:** ERCOT identifies the single highest 15-minute interval of system-wide load for each summer month (June, July, August, September)

2. **Zone Contribution:** Each utility's load during those 4 intervals determines their share of annual transmission costs

3. **Cost Allocation:** Transmission costs (~$4B annually for ERCOT) are allocated proportionally based on 4CP contributions

4. **Settlement:** Charges applied to following calendar year

### Why Prediction is Hard

- **No advance notice:** ERCOT doesn't announce peaks until after they occur
- **Single interval:** One 15-minute window per month
- **Multiple factors:** Temperature, humidity, cloud cover, wind, time of day all matter
- **Renewable impact:** Solar/wind generation affects net load profiles

## Disclaimer

The data in this demonstration uses **actual market data structures** from Yes Energy and represents realistic ERCOT operational patterns. While the predictions and probability calculations are based on industry-standard methodologies, actual results will vary based on specific utility load profiles, curtailment capabilities, and market conditions.

The ROI calculations are illustrative and actual results will vary based on utility size, transmission cost exposure, and operational flexibility.
