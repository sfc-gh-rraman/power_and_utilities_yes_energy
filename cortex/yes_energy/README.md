# Yes Energy Market Agent

Multi-ISO power market intelligence agent powered by Yes Energy data.

## Coverage

| ISO | Region | Key Hubs |
|-----|--------|----------|
| ERCOT | Texas | HB_WEST, HB_HOUSTON, HB_NORTH, HB_SOUTH |
| PJM | Mid-Atlantic/Midwest | WESTERN HUB, EASTERN HUB, AEP GEN HUB |
| MISO | Midwest | ILLINOIS.HUB, INDIANA.HUB, MICHIGAN.HUB |
| CAISO | California | NP15, SP15, ZP26 |
| NYISO | New York | Various zones |
| ISO-NE | New England | .H.INTERNAL_HUB |
| SPP | Southwest | Various hubs |

## Agent Tools

1. **market_analyst** (Cortex Analyst)
   - Queries Yes Energy DART_PRICES, DART_LOADS, IIR_OUTAGES
   - Supports 5x16, 2x16, ATC price products
   - Multi-ISO price comparisons

2. **rto_news_search** (Cortex Search)
   - RTO/ISO news and market intelligence
   - Regulatory updates

## Example Queries

```
What did West Hub 5x16 clear yesterday?
Pull the top 5 PJM RTO load values and hours over the last 5 years
Compare ERCOT vs PJM spot prices this week
What are the current outages in MISO?
Show me Western Hub prices for the last 30 days
```

## Deployment

### Step 1: Semantic Model (Done)
```sql
-- Already uploaded to:
@POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/yes_energy_semantic_model.yaml
```

### Step 2: Deploy Agent in Snowsight

1. Go to **AI & ML → Cortex Agents**
2. Click **+ Agent**
3. Configure:
   - Name: `YES_ENERGY_MARKET_AGENT`
   - Model: Claude 3.5 Sonnet
4. Add Tools:
   - **Cortex Analyst**: Select `@POWER_UTILITIES_DB.ML.SEMANTIC_MODELS/yes_energy_semantic_model.yaml`
   - **Cortex Search**: Select `POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH`

## Key ObjectIDs Reference

### Price Hubs
| Hub | ObjectID |
|-----|----------|
| ERCOT HB_WEST | 10000697080 |
| ERCOT HB_HOUSTON | 10000697077 |
| ERCOT HB_NORTH | 10000697078 |
| ERCOT HB_SOUTH | 10000697079 |
| PJM WESTERN HUB | 51288 |
| PJM EASTERN HUB | 51217 |

### Load Zones
| Zone | ObjectID |
|------|----------|
| ERCOT RTO | 10000712973 |
| PJM RTO COMBINED | 10000002572 |
| PJM MID-ATLANTIC | 10000002596 |

## Price Products

- **5x16**: Weekday peak hours (HE7-HE22, Mon-Fri) - most liquid
- **2x16**: Weekend peak hours
- **7x8**: Off-peak hours
- **ATC**: Around-the-clock (all hours)
