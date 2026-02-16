"""Knowledge Search Agent - Specialized agent for document search."""

from typing import Optional
import json

class KnowledgeSearchAgent:
    """Agent specialized in searching RTO news and market knowledge base."""
    
    name = "Knowledge Search Agent"
    description = "Searches RTO market news, FERC orders, and regulatory updates"
    
    def __init__(self, snow_conn):
        self.snow_conn = snow_conn
    
    async def process(self, query: str, context: Optional[str] = None) -> dict:
        """Process a search query using Cortex Search."""
        cursor = self.snow_conn.cursor()
        
        search_query = f"""
        SELECT SNOWFLAKE.CORTEX.SEARCH_PREVIEW(
            'POWER_UTILITIES_DB.DOCS.RTO_NEWS_SEARCH',
            '{{"query": "{query}", "columns": ["TITLE", "EXCERPT"], "limit": 5}}'
        ) AS RESULTS
        """
        
        try:
            cursor.execute(search_query)
            result = cursor.fetchone()[0]
            search_results = json.loads(result) if isinstance(result, str) else result
            
            articles = search_results.get('results', [])
            
            answer = f"**Search Results for: \"{query}\"**\n\nFound {len(articles)} relevant articles:\n\n"
            
            sources = []
            for i, article in enumerate(articles, 1):
                title = article.get('TITLE', 'Untitled')
                excerpt = article.get('EXCERPT', 'No excerpt available')
                answer += f"**{i}. {title}**\n{excerpt[:200]}...\n\n"
                sources.append(title)
            
            return {
                'answer': answer,
                'data': articles,
                'sources': sources
            }
            
        except Exception as e:
            return {
                'answer': f"Search encountered an error: {str(e)}. The knowledge base contains 1,000 RTO Insider articles about FERC, ERCOT, SPP, and other market topics.",
                'data': None,
                'sources': []
            }
