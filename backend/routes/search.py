"""Knowledge base search routes using Cortex Search."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
import json

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

@router.post("")
async def search_knowledge(request: Request, search_request: SearchRequest):
    """Search the RTO news knowledge base using Cortex Search."""
    cursor = request.app.state.snow_conn.cursor()
    
    search_query = f"""
    SELECT SNOWFLAKE.CORTEX.SEARCH_PREVIEW(
        'POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH',
        '{{"query": "{search_request.query}", "columns": ["TITLE", "EXCERPT", "PUBLISHED_DATE"], "limit": {search_request.limit}}}'
    ) AS RESULTS
    """
    
    try:
        cursor.execute(search_query)
        result = cursor.fetchone()[0]
        search_results = json.loads(result) if isinstance(result, str) else result
        
        return {
            "query": search_request.query,
            "results": search_results.get('results', []),
            "total": len(search_results.get('results', []))
        }
    except Exception as e:
        return {
            "query": search_request.query,
            "results": [],
            "error": str(e)
        }
