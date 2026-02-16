# VOLT Power & Utilities - SPCS Deployment Guide

## Overview

This guide covers deploying VOLT to Snowpark Container Services (SPCS).

## Prerequisites

1. **Snowflake CLI** - `pip install snowflake-cli-labs`
2. **Docker** - For building container images
3. **Account Setup** - SPCS enabled in your Snowflake account

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   SPCS Container                     │
│  ┌─────────────┐    ┌────────────────────────────┐  │
│  │   nginx     │    │      FastAPI Backend       │  │
│  │  (port 8080)│───▶│      (port 8000)          │  │
│  │             │    │                            │  │
│  │ Static React│    │  /api/load/*              │  │
│  │   Assets    │    │  /api/prices/*            │  │
│  │             │    │  /api/weather/*           │  │
│  └─────────────┘    │  /api/chat/*              │  │
│                     │  /api/peak/*              │  │
│                     └────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 Snowflake Data Layer                 │
│  • YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_LOADS │
│  • POWER_UTILITIES_DB.ML.FOUR_CP_PREDICTIONS        │
│  • POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH          │
│  • POWER_UTILITIES_DB.DOCS.ERCOT_RULES_SEARCH       │
└─────────────────────────────────────────────────────┘
```

## Deployment Steps

### 1. Create SPCS Infrastructure

```sql
USE ROLE ACCOUNTADMIN;
USE DATABASE POWER_UTILITIES_DB;

-- Create schema for SPCS objects
CREATE SCHEMA IF NOT EXISTS SPCS;

-- Create compute pool
CREATE COMPUTE POOL IF NOT EXISTS VOLT_COMPUTE_POOL
    MIN_NODES = 1
    MAX_NODES = 2
    INSTANCE_FAMILY = CPU_X64_XS
    AUTO_SUSPEND_SECS = 3600;

-- Create image repository
CREATE IMAGE REPOSITORY IF NOT EXISTS SPCS.VOLT_IMAGES;

-- Create stage for deployment artifacts
CREATE STAGE IF NOT EXISTS SPCS.VOLT_STAGE
    DIRECTORY = (ENABLE = TRUE);
```

### 2. Build and Push Image

```bash
cd /path/to/power_and_utilities_app

# Build Docker image
docker build -t volt:latest -f deploy/Dockerfile .

# Login to Snowflake registry
snow spcs image-registry login

# Get registry URL
REGISTRY=$(snow spcs image-registry url)

# Tag and push
docker tag volt:latest $REGISTRY/POWER_UTILITIES_DB/SPCS/VOLT_IMAGES/volt:latest
docker push $REGISTRY/POWER_UTILITIES_DB/SPCS/VOLT_IMAGES/volt:latest
```

### 3. Deploy Service

```sql
-- Upload service spec
PUT file://deploy/service_spec.yaml @POWER_UTILITIES_DB.SPCS.VOLT_STAGE AUTO_COMPRESS=FALSE OVERWRITE=TRUE;

-- Create service
CREATE SERVICE IF NOT EXISTS POWER_UTILITIES_DB.SPCS.VOLT_SERVICE
    IN COMPUTE POOL VOLT_COMPUTE_POOL
    FROM SPECIFICATION $$
    spec:
      containers:
        - name: volt
          image: /POWER_UTILITIES_DB/SPCS/VOLT_IMAGES/volt:latest
          env:
            SNOWFLAKE_DATABASE: POWER_UTILITIES_DB
            LOG_LEVEL: INFO
          resources:
            requests:
              memory: 2Gi
              cpu: 1
      endpoints:
        - name: volt-endpoint
          port: 8080
          public: true
    $$;
```

### 4. Verify Deployment

```sql
-- Check service status
SHOW SERVICES IN COMPUTE POOL VOLT_COMPUTE_POOL;

-- Get service URL
SELECT SYSTEM$GET_SERVICE_STATUS('POWER_UTILITIES_DB.SPCS.VOLT_SERVICE');

-- View logs
SELECT SYSTEM$GET_SERVICE_LOGS('POWER_UTILITIES_DB.SPCS.VOLT_SERVICE', 0, 'volt');
```

### 5. Grant Access

```sql
-- Run grant_access.sql
@deploy/grant_access.sql
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SNOWFLAKE_DATABASE | Target database | POWER_UTILITIES_DB |
| SNOWFLAKE_SCHEMA | Default schema | ATOMIC |
| YES_ENERGY_DATABASE | Yes Energy database | YES_ENERGY_FOUNDATION_DATA |
| LOG_LEVEL | Logging verbosity | INFO |

## Monitoring

### Health Check
The service exposes `/health` endpoint:
```bash
curl https://<service-url>/health
```

### Logs
```sql
SELECT SYSTEM$GET_SERVICE_LOGS('POWER_UTILITIES_DB.SPCS.VOLT_SERVICE', 0, 'volt', 100);
```

### Metrics
```sql
-- Service status
SELECT SYSTEM$GET_SERVICE_STATUS('POWER_UTILITIES_DB.SPCS.VOLT_SERVICE');
```

## Troubleshooting

### Service Won't Start
1. Check image was pushed: `SHOW IMAGES IN IMAGE REPOSITORY SPCS.VOLT_IMAGES`
2. Check compute pool: `DESCRIBE COMPUTE POOL VOLT_COMPUTE_POOL`
3. Check logs for errors

### Connection Issues
1. Verify network rule allows egress if needed
2. Check endpoint is public
3. Verify grants are applied

### Data Access Issues
1. Run `grant_access.sql` to set up permissions
2. Verify service role has access to Yes Energy data
3. Check Cortex Search service grants

## Updating the Service

```sql
-- Suspend, update image, resume
ALTER SERVICE POWER_UTILITIES_DB.SPCS.VOLT_SERVICE SUSPEND;

-- Push new image with same tag
-- Then resume
ALTER SERVICE POWER_UTILITIES_DB.SPCS.VOLT_SERVICE RESUME;
```

## Cleanup

```sql
-- Remove service
DROP SERVICE IF EXISTS POWER_UTILITIES_DB.SPCS.VOLT_SERVICE;

-- Remove compute pool (if no other services)
DROP COMPUTE POOL IF EXISTS VOLT_COMPUTE_POOL;
```
