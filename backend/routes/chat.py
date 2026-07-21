"""
Chat API — AI conversation with Sandeep Clone
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, Conversation, Client, ApprovalRequest
from ai.brain import generate_response
import json

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    message: str
    client_id: Optional[int] = None
    session_id: Optional[str] = None
    platform: Optional[str] = "direct"


class MessageResponse(BaseModel):
    response: str
    session_id: str
    mode: str
    model: Optional[str] = None


@router.post("/send")
def send_message(body: ChatMessage, db: Session = Depends(get_db)):
    """
    Send a message to AI and get a response.
    Conversation is saved to DB automatically.
    """
    session_id = body.session_id or str(uuid.uuid4())

    # Fetch client context if client_id provided
    client_data = None
    if body.client_id:
        client = db.query(Client).filter(Client.id == body.client_id).first()
        if client:
            client_data = {
                "name": client.name,
                "company": client.company,
                "requirement": client.requirement,
                "status": client.status,
                "platform": client.platform,
            }

    # Get conversation history for this session
    history_records = db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.created_at.asc()).limit(20).all()

    history = [{"role": r.role, "content": r.content} for r in history_records]

    # Save user message
    user_msg = Conversation(
        client_id=body.client_id,
        role="user",
        content=body.message,
        platform=body.platform,
        session_id=session_id,
    )
    db.add(user_msg)
    db.commit()

    # Generate AI response
    result = generate_response(
        user_message=body.message,
        history=history,
        client=client_data
    )

    # Save AI response
    ai_msg = Conversation(
        client_id=body.client_id,
        role="ai",
        content=result["response"],
        platform=body.platform,
        session_id=session_id,
        is_sent=False,  # Requires approval before actually sending
    )
    db.add(ai_msg)
    db.commit()

    # If it's a client conversation, create approval for sending
    if body.client_id and client_data:
        approval = ApprovalRequest(
            type="send_message",
            title=f"{client_data['name']} ko AI reply approve karen",
            description=f"AI ka draft reply:\n\n{result['response'][:300]}",
            payload=json.dumps({
                "client_id": body.client_id,
                "session_id": session_id,
                "message": result["response"],
                "conversation_id": ai_msg.id,
            }),
            client_id=body.client_id,
            priority="normal",
        )
        db.add(approval)
        db.commit()

    return {
        "response": result["response"],
        "session_id": session_id,
        "mode": result.get("mode", "mock"),
        "model": result.get("model", "mock"),
    }


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get conversation history for a session."""
    messages = db.query(Conversation).filter(
        Conversation.session_id == session_id
    ).order_by(Conversation.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "platform": m.platform,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


@router.get("/history_by_client/{client_id}")
def get_chat_history_by_client(client_id: int, db: Session = Depends(get_db)):
    """Get conversation history for a specific client."""
    messages = db.query(Conversation).filter(
        Conversation.client_id == client_id
    ).order_by(Conversation.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "platform": m.platform,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db)):
    """Get all unique chat sessions."""
    from sqlalchemy import distinct
    sessions = db.query(
        Conversation.session_id,
        Conversation.client_id,
        Conversation.platform,
    ).distinct(Conversation.session_id).order_by(
        Conversation.created_at.desc()
    ).limit(20).all()

    result = []
    for s in sessions:
        if not s.session_id:
            continue
        # Get last message in this session
        last_msg = db.query(Conversation).filter(
            Conversation.session_id == s.session_id
        ).order_by(Conversation.created_at.desc()).first()

        client_name = None
        if s.client_id:
            client = db.query(Client).filter(Client.id == s.client_id).first()
            if client:
                client_name = client.name

        result.append({
            "session_id": s.session_id,
            "client_id": s.client_id,
            "client_name": client_name,
            "platform": s.platform,
            "last_message": last_msg.content[:60] + "..." if last_msg and len(last_msg.content) > 60 else (last_msg.content if last_msg else ""),
            "last_active": last_msg.created_at.isoformat() if last_msg and last_msg.created_at else None,
        })

    return result
