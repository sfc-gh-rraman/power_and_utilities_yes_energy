# VOLT Power & Utilities - 10 Minute Demo Script

## Demo Assets
- **App URL**: https://e4z3vu-sfpscogs-rraman-aws-si.snowflakecomputing.app
- **Notebooks**: POWER_UTILITIES_DB.ML (Load Forecast, Game Theory, Risk Modeling)
- **Semantic Models**: @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/

---

## OPENING HOOK (30 seconds)

> "Power traders today are drowning in data from 7 different ISOs, thousands of price nodes, and terabytes of hourly data. The question isn't 'do we have the data?' - it's 'can we get insights fast enough to act?'
>
> Today I'll show you how Snowflake transforms a power trading desk from reactive to predictive - with AI agents that speak trader language, risk models that run in seconds, and a unified view across every North American power market."

---

## SECTION 1: THE APP - Mission Control (2-3 minutes)

### Navigate to: App Landing Page
**Talking Points:**
- "This is VOLT - our Power & Utilities Intelligence Platform, running entirely on Snowpark Container Services"
- "React frontend + FastAPI backend, deployed with a single command, auto-scaling on Snowflake compute"
- "No external infrastructure - this runs IN Snowflake, secured by your existing SSO"

### Show: Grid Status / Mission Control
**Key Insight:**
- "Real-time visibility across all ERCOT zones - Houston, North, South, West"
- "This pulls live data from Yes Energy Foundation Data - a Snowflake Marketplace dataset"

### Show: Price Forensics Page
**Talking Points:**
- "Traders need to understand WHY prices moved, not just that they did"
- "We're showing day-ahead vs real-time spreads - this is where money is made or lost"
- "The DA-RT spread is the core arbitrage opportunity in power markets"

### Show: Revenue Risk Page
**Key Insight:**
- "VaR calculations running against live market data"
- "Monte Carlo simulations with 1000 paths - executes in under a second on Snowflake"
- "This replaces Excel models that took hours to run"

---

## SECTION 2: THE AGENT - Natural Language Market Intelligence (3 minutes)

### Setup
> "Now let's talk to the data. Our Cortex Agent understands power market terminology - 5x16, hub spreads, LMPs - the language traders actually use."

### QUESTION 1: Cross-Market Intelligence
**Ask the Agent:**
```
Compare the average day-ahead prices between ERCOT West Hub and PJM Western Hub over the last 7 days. Which market had higher prices?
```

**Expected Result:** PJM ~$71/MWh vs ERCOT ~$20/MWh

**Talking Point:**
> "In one question, we've queried across TWO different ISOs, joined pricing data, and calculated averages. The agent wrote 30 lines of SQL instantly. A analyst would spend 20 minutes doing this manually."

### QUESTION 2: Trader Standard Products (5x16)
**Ask the Agent:**
```
Show me the 5x16 average prices for ERCOT West Hub, PJM Western Hub, and MISO Indiana Hub for the last complete week
```

**Expected Result:** Table with 3 hubs and their 5x16 prices

**Talking Point:**
> "5x16 is the standard power product - weekday peak hours 7am-10pm. The agent knows this is hours 7-22, Monday-Friday. This is domain knowledge built into our semantic model."

### QUESTION 3: Arbitrage Analysis
**Ask the Agent:**
```
Calculate the day-ahead to real-time price spread for PJM Western Hub for each day last week - which day had the biggest arbitrage opportunity?
```

**Expected Result:** Shows daily spreads with best arb day highlighted

**Talking Point:**
> "This is P&L analysis. A positive spread means you could buy in day-ahead and sell in real-time for profit. The agent found Feb 14th had a $10/MWh opportunity. On a 100MW position, that's $16,000 in a single day."

---

## SECTION 3: THE NOTEBOOKS - Advanced Analytics (2 minutes)

### Navigate to: Snowsight → POWER_UTILITIES_DB.ML → Notebooks

### Notebook 1: Load Forecast Model
**Scroll to show:**
- SHAP value plot (feature importance)
- Model comparison table (MAPE scores)

**Key Insight:**
> "We tested a critical question: 'Are we predicting load, or just tracking it?' When lag features dominate, you're not learning drivers - you're just following. Our physics-based model using temperature, humidity, and calendar features achieves 2.8% MAPE WITHOUT autoregressive features."

**Business Value:**
> "This means we can forecast further ahead - not just 1 hour, but 24-48 hours. That's the difference between reactive and proactive trading."

### Notebook 2: Game Theory Analysis
**Scroll to show:**
- Nash Equilibrium visualization
- Cournot competition results

**Key Insight:**
> "We modeled how generators behave strategically. In a Stackelberg game, the large generator (leader) produces 33% of capacity while small generators produce 22%. This explains why large generators can sustain higher prices."

**Business Value:**
> "Understanding strategic behavior helps detect market manipulation and optimize bidding strategies."

### Notebook 3: Risk Modeling
**Scroll to show:**
- VaR distribution chart
- Monte Carlo simulation paths
- Stress test results (Winter Storm Uri scenario)

**Key Insight:**
> "Our Monte Carlo VaR shows 95% confidence we won't lose more than $85K on a $1M position. But the stress test shows Winter Storm Uri-type events could cause $2.3M in losses - that's the tail risk that killed Griddy."

**Business Value:**
> "This is the difference between knowing your expected risk and your extreme risk. The companies that survived Uri had these models."

---

## SECTION 4: DATA ARCHITECTURE (1.5 minutes)

### Show: Snowsight Data Explorer

**Data Layers:**

| Layer | Database/Schema | Description |
|-------|-----------------|-------------|
| **Raw Data** | YES_ENERGY_FOUNDATION_DATA.FOUNDATION | Marketplace data - DART prices, loads, outages across 7 ISOs |
| **Semantic Layer** | @POWER_UTILITIES_DB.ML.SEMANTIC_MODELS | YAML definitions mapping business terms to SQL |
| **Analytics** | POWER_UTILITIES_DB.ANALYTICS | Views, aggregations, 4CP predictions |
| **ML Assets** | POWER_UTILITIES_DB.ML | Notebooks, Model Registry, feature tables |
| **Application** | POWER_UTILITIES_DB.SPCS | Container service, image repo, compute pool |

**Talking Points:**
> "This entire solution uses ONE data platform:
> - Data ingestion: Snowflake Marketplace (Yes Energy)
> - Data transformation: SQL + Python in notebooks  
> - ML/AI: Cortex Analyst, Cortex Search, Snowpark ML
> - Application hosting: Snowpark Container Services
> - Security: Native RBAC, no data leaves Snowflake"

---

## SECTION 5: WHY SNOWFLAKE (30 seconds)

### The Four Pillars:

1. **Unified Data Platform**
   - "No ETL between systems. Marketplace data flows directly to ML to apps."

2. **Native AI/ML**
   - "Cortex Analyst understands '5x16' and 'hub spread' - domain knowledge in natural language."

3. **Real-Time Analytics**  
   - "Monte Carlo with 1000 paths runs in <1 second. VaR updates live."

4. **Cost Optimization**
   - "One platform eliminates: Databricks, separate BI tools, external APIs, container orchestration"

---

## CLOSING

> "What you've seen today:
> - An AI agent that speaks trader language across 7 ISOs
> - Risk models that used to take hours running in seconds
> - A complete application running inside Snowflake's security perimeter
>
> This isn't a demo of what's possible. This is running in production today.
>
> Questions?"

---

## BACKUP QUESTIONS FOR THE AGENT

If time permits or audience requests:

```
What was the peak load in ERCOT Houston zone last week and when did it occur?
```

```
Show me the top 5 hours with highest real-time prices in PJM last month
```

```
What's the average load forecast error by zone in ERCOT over the past 7 days?
```

---

## TECHNICAL DETAILS (if asked)

- **App Stack**: React + Vite + TailwindCSS (frontend), FastAPI + Python (backend)
- **Deployment**: SPCS with CPU_X64_XS compute pool, nginx reverse proxy
- **Data Source**: Yes Energy Foundation Data (Snowflake Marketplace)
- **Semantic Models**: 2 YAML files (~400 lines each) covering 7 ISOs
- **Notebooks**: 3 executed notebooks with full outputs preserved as HTML
- **Agent Tools**: Cortex Analyst (text-to-SQL) + Cortex Search (RTO news)
