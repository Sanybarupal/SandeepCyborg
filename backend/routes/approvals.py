"""
Human Approval System — Most Critical Part of the System
Har bade kaam se pehle aapki permission lega.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, ApprovalRequest, Notification
from datetime import datetime

router = APIRouter(prefix="/approvals", tags=["Approvals"])


class ApprovalCreate(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    payload: Optional[dict] = None
    client_id: Optional[int] = None
    priority: Optional[str] = "normal"


def approval_to_dict(a: ApprovalRequest) -> dict:
    payload = {}
    if a.payload:
        try:
            payload = json.loads(a.payload)
        except Exception:
            payload = {}
    return {
        "id": a.id,
        "type": a.type,
        "title": a.title,
        "description": a.description,
        "payload": payload,
        "status": a.status,
        "priority": a.priority,
        "client_id": a.client_id,
        "reviewed_at": a.reviewed_at.isoformat() if a.reviewed_at else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/")
def list_approvals(
    status: Optional[str] = "pending",
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List approval requests. Default: pending ones."""
    query = db.query(ApprovalRequest)
    if status:
        query = query.filter(ApprovalRequest.status == status)
    total = query.count()
    approvals = query.order_by(ApprovalRequest.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "approvals": [approval_to_dict(a) for a in approvals]
    }


@router.get("/count")
def pending_count(db: Session = Depends(get_db)):
    """Get count of pending approvals (for badge)."""
    count = db.query(ApprovalRequest).filter(
        ApprovalRequest.status == "pending"
    ).count()
    return {"pending": count}


@router.post("/")
def create_approval(data: ApprovalCreate, db: Session = Depends(get_db)):
    """Create a new approval request (AI uses this)."""
    approval = ApprovalRequest(
        type=data.type,
        title=data.title,
        description=data.description,
        payload=json.dumps(data.payload) if data.payload else None,
        client_id=data.client_id,
        priority=data.priority,
    )
    db.add(approval)

    # Create notification
    notif = Notification(
        title="Naya Approval Request!",
        message=data.title,
        type="warning",
        link=f"/approvals",
    )
    db.add(notif)
    db.commit()

    return {"message": "Approval request create ho gayi!", "id": approval.id}


@router.post("/{approval_id}/approve")
def approve_action(approval_id: int, db: Session = Depends(get_db)):
    """
    Aap ne YES bola — action approve kar diya.
    """
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request nahi mili")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Yeh request pehle se {approval.status} hai")

    approval.status = "approved"
    approval.reviewed_at = datetime.utcnow()

    # Notification
    notif = Notification(
        title="Action Approved!",
        message=f"'{approval.title}' approve ho gaya",
        type="success",
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"✅ '{approval.title}' — Approve kar diya gaya!",
        "approval": approval_to_dict(approval),
        "next_action": _get_next_action(approval)
    }


@router.post("/{approval_id}/reject")
def reject_action(approval_id: int, reason: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Aap ne NO bola — action reject kar diya.
    """
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request nahi mili")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Yeh request pehle se {approval.status} hai")

    approval.status = "rejected"
    approval.reviewed_at = datetime.utcnow()
    if reason:
        approval.description = (approval.description or "") + f"\n\n❌ Reject reason: {reason}"

    notif = Notification(
        title="Action Rejected",
        message=f"'{approval.title}' reject ho gaya",
        type="info",
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"❌ '{approval.title}' — Reject kar diya gaya.",
        "approval": approval_to_dict(approval),
    }


@router.post("/{approval_id}/send-back")
def send_back_action(approval_id: int, feedback: dict, db: Session = Depends(get_db)):
    """
    Send back to AI with feedback.
    """
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request nahi mili")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail=f"Yeh request pehle se {approval.status} hai")

    comment = feedback.get("feedback", "")
    approval.status = "rejected" # or custom status
    approval.reviewed_at = datetime.utcnow()
    approval.description = (approval.description or "") + f"\n\n🔄 Sent back to AI with Feedback: {comment}"

    # Also log it as a notification
    notif = Notification(
        title="Sent Back to AI",
        message=f"'{approval.title}' returned with feedback: {comment}",
        type="info",
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"🔄 '{approval.title}' AI ko wapas bhej di gayi hai.",
        "approval": approval_to_dict(approval),
    }


@router.put("/{approval_id}")
def update_approval(approval_id: int, data: dict, db: Session = Depends(get_db)):
    """
    Update approval details (e.g. edit draft payload).
    """
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request nahi mili")
    
    if "payload" in data:
        approval.payload = json.dumps(data["payload"])
    if "description" in data:
        approval.description = data["description"]
    if "title" in data:
        approval.title = data["title"]
        
    db.commit()
    db.refresh(approval)
    return {"message": "Approval update ho gayi!", "approval": approval_to_dict(approval)}


def _get_next_action(approval: ApprovalRequest) -> str:
    """Return a description of what happens after approval."""
    action_map = {
        "send_message": "Message ab client ko bheja jayega",
        "bulk_message": "Bulk messages schedule ho jayenge",
        "import_clients": "CSV se clients import ho jayenge",
        "github_push": "Code GitHub par push ho jayega",
        "vercel_deploy": "Website Vercel par deploy ho jayegi",
        "send_proposal": "Proposal client ko bheja jayega",
        "make_call": "Call schedule ho jayegi",
    }
    return action_map.get(approval.type, "Kaam shuru ho jayega")
