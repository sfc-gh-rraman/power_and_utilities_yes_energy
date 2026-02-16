# Power & Utilities Solution Presentation - Image Requirements

This document describes the images needed for the Power & Utilities solution presentation. The current images are placeholders from the Capital Delivery presentation and should be replaced with Power & Utilities-specific versions.

## Required Images

### 1. problem-impact.png
**Title:** "4CP Transmission Cost Exposure"
**Content:**
- Main stat: "$15-25M" Average Annual 4CP Charges
- Subtitle: "For a 1,000 MW utility in ERCOT"
- Three callout boxes:
  - "$2-5M" - Cost per Missed Peak
  - "<40%" - Industry Success Rate (all 4 peaks)
  - "65%" - Temperature-only Correlation (insufficient)
- Visual: Power grid/transmission tower imagery

### 2. hidden-pattern.png
**Title:** "The 4CP Prediction Challenge"
**Content:**
- BEFORE side: "Temperature-Based Monitoring"
  - Simple hot/cold threshold
  - "Pattern: HIDDEN" indicator
  - "$4-10M ANNUAL EXPOSURE"
- AFTER side: "ML-Powered Prediction"
  - Multi-factor model visualization
  - "4-HOUR EARLY WARNING" badge
  - "12 Features" indicator
  - "$0 PREVENTED EXPOSURE"
- Visual: Weather icons → AI brain transformation

### 3. before-after.png
**Title:** "Grid Operations Transformation"
**Content:**
- BEFORE side: "Reactive"
  - Weather forecast only
  - Siloed data
  - Manual monitoring
  - "$4-10M Per Summer" cost
- AFTER side: "Predictive"
  - ML model predictions
  - Unified data platform
  - Automated alerts
  - "$0 Prevention Cost"
- Visual: Stressed operator vs. confident operator with VOLT dashboard

### 4. roi-value.png
**Title:** "AI in Grid Operations: Investment & Return Analysis"
**Content:**
- Main value: "Annual Value: $7M" per 1,000 MW utility
- Three value streams:
  - "$5M" - Transmission Cost Avoidance (2 additional peaks)
  - "$1.5M" - Reduced Demand Charges
  - "$0.5M" - Avoided Penalties
- ROI circle: "1,650% ROI"
- Bottom: "Investment: $400K" | "Payback: 1st Avoided Peak" | "Net: $6.6M"

### 5. architecture.png
**Title:** "Intelligent Grid Operations Platform: Architecture"
**Content:**
- DATA SOURCES (left):
  - Yes Energy (DART_LOADS) - "5-min intervals"
  - Weather APIs - "Hourly updates"
  - ERCOT Public Data - "System load"
  - Historical 4CP - "Training data"
- SNOWFLAKE DATA CLOUD (center):
  - INGESTION: Snowpipe, External Tables
  - PROCESSING: RAW → ATOMIC, Snowpark ML
  - AI SERVICES: Cortex Search, Cortex LLM, Cortex Agent
- APPLICATIONS (right):
  - VOLT Dashboard (React app)
  - Cortex Agent (Natural language)
  - API Endpoints (Integration)
  - Snowflake Notebooks (Analysis)

### 6. data-erd.png
**Title:** "Data Model: RAW → ATOMIC Schema"
**Content:**
- RAW SCHEMA (left):
  - DART_LOADS_RAW: datetime, rtload, daload, objectid (~78K records)
  - WEATHER_RAW: timestamp, temp, humidity, conditions
  - ERCOT_SYSTEM_RAW: interval, total_load, wind_gen
- ATOMIC SCHEMA (right):
  - LOAD_INTERVALS: INTERVAL_ID (PK), DATETIME, ZONE, RTLOAD, DALOAD
  - WEATHER_HOURLY: WEATHER_ID (PK), DATETIME, TEMP_F, HUMIDITY_PCT
  - PEAK_EVENTS: EVENT_ID (PK), DATETIME, IS_4CP, CONTRIBUTING_FACTORS
  - PREDICTIONS: PRED_ID (PK), DATETIME, PROBABILITY, RISK_LEVEL

### 7. dashboard.png
**Title:** "VOLT Mission Control"
**Content:**
- Header: "VOLT | Grid Operations | ERCOT Summer Peak Season"
- Left sidebar: Mission Control, 4CP Predictor, Zone Analysis, Peak History, Architecture
- Main content:
  - Grid Health panel: 4CP Risk gauge (showing 75%), System Load gauge
  - VOLT Co-Pilot Chat: Alert showing "75% probability of 4CP peak between 5:00-6:00 PM"
  - Active Alerts panel: "HIGH 4CP RISK" and "HOUSTON ZONE ELEVATED"
- Footer: "Powered by Cortex AI"

## Color Scheme
- Primary: Deep blue/teal (#0A1628)
- Accent: Cyan/electric blue (#00D4FF)
- Warning: Yellow/amber (#FFD93D)
- Critical: Red/orange (#FF6B6B)
- Success: Green (#4ADE80)
- Snowflake logo where appropriate

## Notes
- All images should maintain the same visual style as Capital Delivery
- Update terminology: ATLAS → VOLT, Change Orders → 4CP Peaks, Portfolio → Grid Operations
- Keep Snowflake branding consistent
- Resolution: 1400x800px (presentation format)
