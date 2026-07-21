"""
Clients API — CRUD operations for client management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from typing import Optional
from database import get_db, Client, ApprovalRequest
from datetime import datetime

router = APIRouter(prefix="/clients", tags=["Clients"])


# ─── Pydantic Schemas ──────────────────────────────

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    requirement: Optional[str] = None
    platform: Optional[str] = "direct"
    status: Optional[str] = "lead"
    tags: Optional[str] = None
    notes: Optional[str] = None
    ai_paused: Optional[bool] = False

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    requirement: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    ai_paused: Optional[bool] = None


# ─── Helpers ───────────────────────────────────────

def client_to_dict(c: Client) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "phone": c.phone,
        "company": c.company,
        "email": c.email,
        "requirement": c.requirement,
        "platform": c.platform,
        "status": c.status,
        "tags": c.tags,
        "notes": c.notes,
        "ai_paused": c.ai_paused,
        "last_contact": c.last_contact.isoformat() if c.last_contact else None,
        "next_followup": c.next_followup.isoformat() if c.next_followup else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


# ─── Routes ────────────────────────────────────────

@router.get("/")
def list_clients(
    search: Optional[str] = None,
    status: Optional[str] = None,
    platform: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List all clients with optional filters."""
    query = db.query(Client)

    if search:
        query = query.filter(
            or_(
                Client.name.ilike(f"%{search}%"),
                Client.company.ilike(f"%{search}%"),
                Client.email.ilike(f"%{search}%"),
                Client.phone.ilike(f"%{search}%"),
            )
        )
    if status:
        query = query.filter(Client.status == status)
    if platform:
        query = query.filter(Client.platform == platform)

    total = query.count()
    clients = query.order_by(Client.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "clients": [client_to_dict(c) for c in clients]
    }


@router.post("/")
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client."""
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return {"message": "Client add ho gaya!", "client": client_to_dict(client)}


@router.get("/{client_id}")
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get single client by ID."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client nahi mila")
    return client_to_dict(client)


@router.put("/{client_id}")
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db)):
    """Update client details."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client nahi mila")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(client, field, value)
    client.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(client)
    return {"message": "Client update ho gaya!", "client": client_to_dict(client)}


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client nahi mila")
    db.delete(client)
    db.commit()
    return {"message": f"{client.name} ko delete kar diya"}


@router.post("/{client_id}/message")
def request_message_approval(
    client_id: int,
    body: dict,
    db: Session = Depends(get_db)
):
    """Request approval to send message to a client."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client nahi mila")

    import json
    approval = ApprovalRequest(
        type="send_message",
        title=f"{client.name} ko message bhejna",
        description=f"Platform: {client.platform or 'WhatsApp'}\nMessage: {body.get('message', '')[:100]}",
        payload=json.dumps({
            "client_id": client_id,
            "client_name": client.name,
            "platform": body.get("platform", client.platform),
            "message": body.get("message", ""),
        }),
        client_id=client_id,
        priority="normal",
    )
    db.add(approval)
    db.commit()
    return {"message": "Approval request create ho gayi!", "approval_id": approval.id}
