-- ============================================================================
-- POWER & UTILITIES INTELLIGENCE PLATFORM - Data Ingestion from YES_ENERGY
-- ============================================================================
-- Stored procedures and tasks to ingest data from YES_ENERGY_FOUNDATION_DATA
-- ============================================================================

USE DATABASE POWER_UTILITIES_DB;
USE SCHEMA RAW;

-- ============================================================================
-- PRICE NODE SYNC
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_PRICE_NODES()
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    MERGE INTO ATOMIC.PRICE_NODE tgt
    USING (
        SELECT 
            OBJECTID,
            PNODENAME,
            ZONE,
            NODETYPE,
            'ERCOT' AS ISO,
            FIRST_DART_DATE,
            LAST_DART_DATE,
            STATUS
        FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.PRICE_NODES
        WHERE ISO = 'ERCOT'
    ) src
    ON tgt.YES_ENERGY_OBJECT_ID = src.OBJECTID
    WHEN MATCHED THEN UPDATE SET
        tgt.NODE_NAME = src.PNODENAME,
        tgt.ZONE_CODE = src.ZONE,
        tgt.NODE_TYPE = src.NODETYPE,
        tgt.FIRST_PRICE_DATE = src.FIRST_DART_DATE,
        tgt.LAST_PRICE_DATE = src.LAST_DART_DATE,
        tgt.STATUS = src.STATUS
    WHEN NOT MATCHED THEN INSERT (
        YES_ENERGY_OBJECT_ID, NODE_NAME, ZONE_CODE, NODE_TYPE, ISO, 
        FIRST_PRICE_DATE, LAST_PRICE_DATE, STATUS
    ) VALUES (
        src.OBJECTID, src.PNODENAME, src.ZONE, src.NODETYPE, src.ISO,
        src.FIRST_DART_DATE, src.LAST_DART_DATE, src.STATUS
    );
    
    RETURN 'Price nodes synchronized successfully';
END;
$$;

-- ============================================================================
-- LOAD DATA SYNC (Zone-level aggregation)
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_HOURLY_LOAD(START_DATE DATE, END_DATE DATE)
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO ATOMIC.HOURLY_LOAD (ZONE_CODE, DATETIME_UTC, DATETIME_LOCAL, LOAD_MW, DATA_SOURCE)
    SELECT 
        lz.ZONENAME AS ZONE_CODE,
        tl.DATETIME AS DATETIME_UTC,
        CONVERT_TIMEZONE('UTC', 'America/Chicago', tl.DATETIME) AS DATETIME_LOCAL,
        tl.VALUE AS LOAD_MW,
        'YES_ENERGY' AS DATA_SOURCE
    FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.TS_LOAD tl
    JOIN YES_ENERGY_FOUNDATION_DATA.FOUNDATION.LOAD_ZONES lz
        ON tl.OBJECTID = lz.OBJECTID
    WHERE lz.ISO = 'ERCOT'
        AND lz.ZONETYPE = 'ZONE'
        AND tl.DATETIME >= :START_DATE
        AND tl.DATETIME < :END_DATE
    ON CONFLICT (ZONE_CODE, DATETIME_UTC) DO UPDATE SET
        LOAD_MW = EXCLUDED.LOAD_MW;
        
    RETURN 'Load data synchronized for ' || :START_DATE || ' to ' || :END_DATE;
END;
$$;

-- ============================================================================
-- LMP DATA SYNC
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_HOURLY_LMP(START_DATE DATE, END_DATE DATE)
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO ATOMIC.HOURLY_LMP (
        NODE_NAME, ZONE_CODE, DATETIME_UTC, DATETIME_LOCAL,
        DA_LMP, DA_CONGESTION, DA_LOSS,
        RT_LMP, RT_CONGESTION, RT_LOSS,
        DA_RT_SPREAD, IS_PRICE_SPIKE, DATA_SOURCE
    )
    SELECT 
        pn.PNODENAME AS NODE_NAME,
        pn.ZONE AS ZONE_CODE,
        dp.DATETIME AS DATETIME_UTC,
        CONVERT_TIMEZONE('UTC', dp.TIMEZONE, dp.DATETIME) AS DATETIME_LOCAL,
        dp.DALMP AS DA_LMP,
        dp.DACONG AS DA_CONGESTION,
        dp.DALOSS AS DA_LOSS,
        dp.RTLMP AS RT_LMP,
        dp.RTCONG AS RT_CONGESTION,
        dp.RTLOSS AS RT_LOSS,
        dp.DALMP - dp.RTLMP AS DA_RT_SPREAD,
        CASE WHEN dp.RTLMP > 100 OR dp.RTLMP < -50 THEN TRUE ELSE FALSE END AS IS_PRICE_SPIKE,
        'YES_ENERGY' AS DATA_SOURCE
    FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.DART_PRICES dp
    JOIN YES_ENERGY_FOUNDATION_DATA.FOUNDATION.PRICE_NODES pn
        ON dp.OBJECTID = pn.OBJECTID
    WHERE pn.ISO = 'ERCOT'
        AND pn.NODETYPE IN ('HUB', 'LOAD', 'ZONE')
        AND dp.DATETIME >= :START_DATE
        AND dp.DATETIME < :END_DATE
    ON CONFLICT (NODE_NAME, DATETIME_UTC) DO UPDATE SET
        DA_LMP = EXCLUDED.DA_LMP,
        DA_CONGESTION = EXCLUDED.DA_CONGESTION,
        RT_LMP = EXCLUDED.RT_LMP,
        RT_CONGESTION = EXCLUDED.RT_CONGESTION;
        
    RETURN 'LMP data synchronized for ' || :START_DATE || ' to ' || :END_DATE;
END;
$$;

-- ============================================================================
-- WEATHER DATA SYNC
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_HOURLY_WEATHER(START_DATE DATE, END_DATE DATE)
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO ATOMIC.HOURLY_WEATHER (
        ZONE_CODE, DATETIME_UTC, DATETIME_LOCAL,
        TEMP_F, DEW_POINT_F, WIND_SPEED_MPH, HUMIDITY_PCT, PRECIP_IN,
        CDD, HDD, WIND_CHILL_F, IS_EXTREME_WEATHER, DATA_SOURCE
    )
    SELECT 
        CASE 
            WHEN w.OBJECTID IN (SELECT OBJECTID FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.LOAD_ZONES WHERE ZONENAME = 'WZ_Coast') THEN 'HOUSTON'
            WHEN w.OBJECTID IN (SELECT OBJECTID FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.LOAD_ZONES WHERE ZONENAME IN ('WZ_North', 'WZ_NorthCentral')) THEN 'NORTH'
            WHEN w.OBJECTID IN (SELECT OBJECTID FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.LOAD_ZONES WHERE ZONENAME IN ('WZ_Southern', 'WZ_SouthCentral')) THEN 'SOUTH'
            WHEN w.OBJECTID IN (SELECT OBJECTID FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.LOAD_ZONES WHERE ZONENAME IN ('WZ_West', 'WZ_FarWest')) THEN 'WEST'
            ELSE 'UNKNOWN'
        END AS ZONE_CODE,
        w.DATETIME_UTC,
        w.DATETIME AS DATETIME_LOCAL,
        w.ACTUAL_DRY_BULB_TEMP_F AS TEMP_F,
        w.ACTUAL_DEW_POINT_F AS DEW_POINT_F,
        w.ACTUAL_WIND_SPEED_MPH AS WIND_SPEED_MPH,
        w.ACTUAL_RELATIVE_HUMIDITY_PCT AS HUMIDITY_PCT,
        w.ACTUAL_HOURLY_PRECIP_IN AS PRECIP_IN,
        GREATEST(w.ACTUAL_DRY_BULB_TEMP_F - 65, 0) AS CDD,
        GREATEST(65 - w.ACTUAL_DRY_BULB_TEMP_F, 0) AS HDD,
        CASE 
            WHEN w.ACTUAL_DRY_BULB_TEMP_F < 50 AND w.ACTUAL_WIND_SPEED_MPH > 3 THEN
                35.74 + 0.6215 * w.ACTUAL_DRY_BULB_TEMP_F - 35.75 * POWER(w.ACTUAL_WIND_SPEED_MPH, 0.16) + 0.4275 * w.ACTUAL_DRY_BULB_TEMP_F * POWER(w.ACTUAL_WIND_SPEED_MPH, 0.16)
            ELSE w.ACTUAL_DRY_BULB_TEMP_F
        END AS WIND_CHILL_F,
        CASE WHEN w.ACTUAL_DRY_BULB_TEMP_F > 100 OR w.ACTUAL_DRY_BULB_TEMP_F < 32 THEN TRUE ELSE FALSE END AS IS_EXTREME_WEATHER,
        'YES_ENERGY' AS DATA_SOURCE
    FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.ALL_WEATHER_MV w
    WHERE w.DATETIME_UTC >= :START_DATE
        AND w.DATETIME_UTC < :END_DATE
    ON CONFLICT (ZONE_CODE, DATETIME_UTC) DO UPDATE SET
        TEMP_F = EXCLUDED.TEMP_F,
        WIND_SPEED_MPH = EXCLUDED.WIND_SPEED_MPH,
        CDD = EXCLUDED.CDD,
        HDD = EXCLUDED.HDD;
        
    RETURN 'Weather data synchronized for ' || :START_DATE || ' to ' || :END_DATE;
END;
$$;

-- ============================================================================
-- FUEL PRICE SYNC
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_DAILY_FUEL_PRICES(START_DATE DATE, END_DATE DATE)
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    INSERT INTO ATOMIC.DAILY_FUEL_PRICE (PRICE_DATE, NG_HENRY_HUB, DATA_SOURCE)
    SELECT 
        DATE(fp.DATETIME) AS PRICE_DATE,
        AVG(fp.VALUE) AS NG_HENRY_HUB,
        'YES_ENERGY' AS DATA_SOURCE
    FROM YES_ENERGY_FOUNDATION_DATA.FOUNDATION.TS_FUEL_PRICES_V fp
    WHERE fp.DATETIME >= :START_DATE
        AND fp.DATETIME < :END_DATE
    GROUP BY DATE(fp.DATETIME)
    ON CONFLICT (PRICE_DATE) DO UPDATE SET
        NG_HENRY_HUB = EXCLUDED.NG_HENRY_HUB;
        
    RETURN 'Fuel price data synchronized for ' || :START_DATE || ' to ' || :END_DATE;
END;
$$;

-- ============================================================================
-- MASTER SYNC PROCEDURE
-- ============================================================================

CREATE OR REPLACE PROCEDURE SYNC_ALL_DATA(START_DATE DATE, END_DATE DATE)
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
DECLARE
    result VARCHAR;
BEGIN
    CALL SYNC_PRICE_NODES();
    CALL SYNC_HOURLY_LOAD(:START_DATE, :END_DATE);
    CALL SYNC_HOURLY_LMP(:START_DATE, :END_DATE);
    CALL SYNC_HOURLY_WEATHER(:START_DATE, :END_DATE);
    CALL SYNC_DAILY_FUEL_PRICES(:START_DATE, :END_DATE);
    
    RETURN 'All data synchronized for ' || :START_DATE || ' to ' || :END_DATE;
END;
$$;

-- ============================================================================
-- SCHEDULED TASK (runs daily)
-- ============================================================================

CREATE OR REPLACE TASK DAILY_DATA_SYNC
    WAREHOUSE = POWER_UTILITIES_WH
    SCHEDULE = 'USING CRON 0 6 * * * America/Chicago'
AS
    CALL SYNC_ALL_DATA(CURRENT_DATE() - 1, CURRENT_DATE());

-- Enable the task
-- ALTER TASK DAILY_DATA_SYNC RESUME;
