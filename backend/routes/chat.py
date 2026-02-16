"""Chat endpoint using multi-agent orchestrator."""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from agents.orchestrator import AgentOrchestrator

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

@router.post("")
async def chat(request: Request, chat_request: ChatRequest):
    """Process a chat message through the agent orchestrator."""
    orchestrator = AgentOrchestrator(request.app.state.snow_conn)
    
    result = await orchestrator.process_query(
        chat_request.message,
        chat_request.context
    )
    
    return {
        "response": result['response'],
        "agent": result['agent'],
        "intent": result['intent'],
        "data": result.get('data'),
        "sources": result.get('sources', [])
    }
