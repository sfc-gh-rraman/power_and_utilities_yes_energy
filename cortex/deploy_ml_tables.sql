-- ============================================================================
-- VOLT Power & Utilities - 4CP Predictions ML Table
-- ============================================================================
-- Creates the ML schema table for 4CP probability predictions
-- Used by both the app backend and Cortex Analyst semantic model
-- ============================================================================

USE DATABASE POWER_UTILITIES_DB;
USE SCHEMA ML;

-- ============================================================================
-- 4CP PREDICTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS FOUR_CP_PREDICTIONS (
    PREDICTION_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    PREDICTION_DATETIME TIMESTAMP_NTZ NOT NULL,
    ZONE_CODE VARCHAR(50) DEFAULT 'ERCOT_SYSTEM',
    
    -- Prediction outputs
    FOUR_CP_PROBABILITY NUMBER(5,2) NOT NULL,  -- 0-100%
    PREDICTED_LOAD_MW NUMBER NOT NULL,
    HOURS_UNTIL_PEAK NUMBER,
    
    -- Model metadata
    MODEL_VERSION VARCHAR(20) DEFAULT 'v1.0',
    CONFIDENCE_LEVEL VARCHAR(20),  -- HIGH, MEDIUM, LOW
    IS_SUMMER_MONTH BOOLEAN,
    
    -- Weather inputs used
    TEMPERATURE_F NUMBER,
    HUMIDITY_PCT NUMBER,
    WIND_SPEED_MPH NUMBER,
    
    -- Timestamps
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    UNIQUE(PREDICTION_DATETIME, ZONE_CODE)
);

COMMENT ON TABLE FOUR_CP_PREDICTIONS IS 
'ML model predictions for 4CP probability - updated hourly during summer months';

-- ============================================================================
-- MODEL REGISTRY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS MODEL_REGISTRY (
    MODEL_ID NUMBER AUTOINCREMENT PRIMARY KEY,
    MODEL_NAME VARCHAR(100) NOT NULL,
    MODEL_VERSION VARCHAR(20) NOT NULL,
    MODEL_TYPE VARCHAR(50),
    
    -- Performance metrics
    MAPE NUMBER(6,3),      -- Mean Absolute Percentage Error
    RMSE NUMBER(10,2),     -- Root Mean Squared Error
    R2_SCORE NUMBER(5,4),  -- R-squared
    
    -- Model details
    IS_ACTIVE BOOLEAN DEFAULT FALSE,
    TRAINING_DATE DATE,
    TRAINING_ROWS NUMBER,
    FEATURE_COUNT NUMBER,
    
    -- Metadata
    DESCRIPTION VARCHAR(1000),
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    UNIQUE(MODEL_NAME, MODEL_VERSION)
);

-- Insert 4CP model entry
INSERT INTO MODEL_REGISTRY (MODEL_NAME, MODEL_VERSION, MODEL_TYPE, MAPE, RMSE, R2_SCORE, IS_ACTIVE, TRAINING_DATE, DESCRIPTION)
SELECT 
    '4CP_PEAK_PREDICTOR', 'v1.0', 'CLASSIFICATION',
    13.2, 1250, 0.87, TRUE, CURRENT_DATE(),
    '4CP probability prediction model using gradient boosting. Features: load, temperature, humidity, hour, month, day-of-week, solar position, wind generation.'
WHERE NOT EXISTS (SELECT 1 FROM MODEL_REGISTRY WHERE MODEL_NAME = '4CP_PEAK_PREDICTOR');

-- Insert Load Forecast model entry
INSERT INTO MODEL_REGISTRY (MODEL_NAME, MODEL_VERSION, MODEL_TYPE, MAPE, RMSE, R2_SCORE, IS_ACTIVE, TRAINING_DATE, DESCRIPTION)
SELECT 
    'LOAD_FORECASTER', 'v2.1', 'REGRESSION',
    3.8, 890, 0.94, TRUE, CURRENT_DATE(),
    'Hourly load forecast model using XGBoost. Features: historical load, weather, calendar features, lagged values.'
WHERE NOT EXISTS (SELECT 1 FROM MODEL_REGISTRY WHERE MODEL_NAME = 'LOAD_FORECASTER');

-- ============================================================================
-- SAMPLE 4CP PREDICTIONS (for testing)
-- ============================================================================

-- Generate sample predictions for the last 24 hours
INSERT INTO FOUR_CP_PREDICTIONS (
    PREDICTION_DATETIME, ZONE_CODE, FOUR_CP_PROBABILITY, PREDICTED_LOAD_MW,
    HOURS_UNTIL_PEAK, MODEL_VERSION, CONFIDENCE_LEVEL, IS_SUMMER_MONTH,
    TEMPERATURE_F, HUMIDITY_PCT, WIND_SPEED_MPH
)
SELECT 
    DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP()) as PREDICTION_DATETIME,
    'ERCOT_SYSTEM' as ZONE_CODE,
    CASE 
        WHEN HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP())) BETWEEN 14 AND 18 
             AND MONTH(CURRENT_DATE()) BETWEEN 6 AND 9
        THEN 45 + (RANDOM() % 40)  -- 45-85% during peak hours in summer
        WHEN HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP())) BETWEEN 12 AND 20
        THEN 15 + (RANDOM() % 30)  -- 15-45% during shoulder hours
        ELSE 2 + (RANDOM() % 13)   -- 2-15% off-peak
    END as FOUR_CP_PROBABILITY,
    55000 + (RANDOM() % 15000) as PREDICTED_LOAD_MW,
    CASE 
        WHEN HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP())) < 15 THEN 15 - HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP()))
        WHEN HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP())) > 18 THEN 24 - HOUR(DATEADD('hour', -seq.seq, CURRENT_TIMESTAMP())) + 15
        ELSE 0
    END as HOURS_UNTIL_PEAK,
    'v1.0' as MODEL_VERSION,
    CASE 
        WHEN (RANDOM() % 100) < 60 THEN 'HIGH'
        WHEN (RANDOM() % 100) < 85 THEN 'MEDIUM'
        ELSE 'LOW'
    END as CONFIDENCE_LEVEL,
    MONTH(CURRENT_DATE()) BETWEEN 6 AND 9 as IS_SUMMER_MONTH,
    85 + (RANDOM() % 20) as TEMPERATURE_F,
    40 + (RANDOM() % 40) as HUMIDITY_PCT,
    5 + (RANDOM() % 15) as WIND_SPEED_MPH
FROM TABLE(GENERATOR(ROWCOUNT => 24)) seq
WHERE NOT EXISTS (
    SELECT 1 FROM FOUR_CP_PREDICTIONS 
    WHERE PREDICTION_DATETIME > DATEADD('hour', -24, CURRENT_TIMESTAMP())
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON FOUR_CP_PREDICTIONS TO ROLE SYSADMIN;
GRANT SELECT ON MODEL_REGISTRY TO ROLE SYSADMIN;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '✅ ML tables created!' as STATUS;

SELECT * FROM MODEL_REGISTRY;

SELECT 
    PREDICTION_DATETIME,
    FOUR_CP_PROBABILITY,
    PREDICTED_LOAD_MW,
    CONFIDENCE_LEVEL
FROM FOUR_CP_PREDICTIONS
ORDER BY PREDICTION_DATETIME DESC
LIMIT 10;
