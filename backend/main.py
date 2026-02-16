"""
Power & Utilities Intelligence Platform - FastAPI Backend
Multi-agent architecture for ERCOT market analytics
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

def get_snowflake_connection():
    """Get Snowflake connection - works in SPCS (token auth) and locally (connection name)."""
    snowflake_host = os.getenv("SNOWFLAKE_HOST")
    
    if snowflake_host:
        # Running in SPCS - use token-based authentication
        conn = snowflake.connector.connect(
            host=snowflake_host,
            account=os.getenv("SNOWFLAKE_ACCOUNT"),
            authenticator="oauth",
            token=open("/snowflake/session/token").read(),
            database=os.getenv("SNOWFLAKE_DATABASE", "POWER_UTILITIES_DB"),
            schema=os.getenv("SNOWFLAKE_SCHEMA", "ATOMIC"),
            warehouse="COMPUTE_WH",
        )
        return conn
    else:
        # Running locally - use connection name
        return snowflake.connector.connect(
            connection_name=os.getenv("SNOWFLAKE_CONNECTION_NAME", "my_snowflake")
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.snow_conn = get_snowflake_connection()
    yield
    app.state.snow_conn.close()

app = FastAPI(
    title="Power & Utilities Intelligence Platform",
    description="ERCOT Market Analytics with Multi-Agent AI",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.routes import grid, prices, weather, chat, search, peak_prediction, risk, dispatch

app.include_router(grid.router, prefix="/api/grid", tags=["Grid"])
app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(peak_prediction.router, prefix="/api/peak", tags=["Peak Prediction"])
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Analytics"])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["Dispatch Simulation"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "power-utilities-api"}

@app.get("/api/models")
async def get_models():
    cursor = app.state.snow_conn.cursor()
    cursor.execute("""
        SELECT MODEL_ID, MODEL_NAME, MODEL_VERSION, MODEL_TYPE, 
               MAPE, RMSE, R2_SCORE, IS_ACTIVE
        FROM POWER_UTILITIES_DB.ML.MODEL_REGISTRY
    """)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@app.get("/api/patterns")
async def get_hidden_patterns():
    cursor = app.state.snow_conn.cursor()
    cursor.execute("""
        SELECT * FROM POWER_UTILITIES_DB.ANALYTICS.V_HIDDEN_PATTERNS_SUMMARY
    """)
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
