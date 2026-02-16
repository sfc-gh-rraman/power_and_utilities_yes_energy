"""
Multi-Agent Orchestrator for Power & Utilities Platform
Routes queries to specialized agents based on intent
"""

from typing import Optional
from agents.load_agent import LoadForecastAgent
from agents.price_agent import PriceAnalystAgent
from agents.weather_agent import WeatherRiskAgent
from agents.search_agent import KnowledgeSearchAgent

class AgentOrchestrator:
    """Routes queries to appropriate specialized agents."""
    
    def __init__(self, snow_conn):
        self.snow_conn = snow_conn
        self.agents = {
            'load': LoadForecastAgent(snow_conn),
            'price': PriceAnalystAgent(snow_conn),
            'weather': WeatherRiskAgent(snow_conn),
            'search': KnowledgeSearchAgent(snow_conn),
        }
        
        self.intent_keywords = {
            'load': ['load', 'demand', 'forecast', 'mw', 'consumption', 'usage'],
            'price': ['price', 'lmp', 'cost', 'spike', 'congestion', 'spread'],
            'weather': ['weather', 'temperature', 'wind', 'heat', 'cold', 'storm'],
            'search': ['news', 'article', 'ferc', 'regulation', 'policy', 'rto'],
        }
    
    def classify_intent(self, query: str) -> str:
        """Classify user query intent to route to appropriate agent."""
        query_lower = query.lower()
        
        scores = {}
        for intent, keywords in self.intent_keywords.items():
            scores[intent] = sum(1 for kw in keywords if kw in query_lower)
        
        if max(scores.values()) == 0:
            return 'load'
        
        return max(scores, key=scores.get)
    
    async def process_query(self, query: str, context: Optional[str] = None) -> dict:
        """Process a user query through the appropriate agent."""
        intent = self.classify_intent(query)
        agent = self.agents[intent]
        
        response = await agent.process(query, context)
        
        return {
            'intent': intent,
            'agent': agent.name,
            'response': response['answer'],
            'data': response.get('data'),
            'sources': response.get('sources', []),
        }
