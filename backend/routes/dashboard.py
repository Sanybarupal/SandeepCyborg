"""
Dashboard Stats API
Saare summary numbers yahan se aate hain.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Client, Conversation, ApprovalRequest, Project, Notification
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Main dashboard overview stats."""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Client counts
    total_clients = db.query(Client).count()
    new_leads = db.query(Client).filter(Client.status == "lead").count()
    active_projects = db.query(Project).filter(
        Project.status.in_(["approved", "in_progress", "review"])
    ).count()

    # Pending approvals
    pending_approvals = db.query(ApprovalRequest).filter(
        ApprovalRequest.status == "pending"
    ).count()

    # Today's conversations
    msgs_today = db.query(Conversation).filter(
        Conversation.created_at >= today_start
    ).count()

    # AI sent messages
    ai_msgs = db.query(Conversation).filter(
        Conversation.role == "ai",
        Conversation.created_at >= today_start
    ).count()

    # User messages today
    user_msgs = db.query(Conversation).filter(
        Conversation.role == "user",
        Conversation.created_at >= today_start
    ).count()

    # Unread notifications
    unread_notifs = db.query(Notification).filter(
        Notification.is_read == False
    ).count()

    # Recent clients (last 5)
    recent_clients = db.query(Client).order_by(
        Client.created_at.desc()
    ).limit(5).all()

    recent_clients_data = [
        {
            "id": c.id,
            "name": c.name,
            "company": c.company,
            "status": c.status,
            "platform": c.platform,
            "requirement": c.requirement,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in recent_clients
    ]

    # Platform breakdown
    platform_stats = {}
    for client in db.query(Client).all():
        p = client.platform or "direct"
        platform_stats[p] = platform_stats.get(p, 0) + 1

    return {
        "overview": {
            "total_clients": total_clients,
            "new_leads": new_leads,
            "active_projects": active_projects,
            "pending_approvals": pending_approvals,
            "msgs_today": msgs_today,
            "unread_notifications": unread_notifs,
        },
        "ai_activity": {
            "messages_sent": ai_msgs,
            "messages_received": user_msgs,
            "total_today": msgs_today,
        },
        "recent_clients": recent_clients_data,
        "platform_breakdown": platform_stats,
    }


@router.get("/activity")
def get_recent_activity(limit: int = 10, db: Session = Depends(get_db)):
    """Recent AI activity feed."""
    convos = db.query(Conversation).order_by(
        Conversation.created_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": c.id,
            "role": c.role,
            "content": c.content[:100] + "..." if len(c.content) > 100 else c.content,
            "platform": c.platform,
            "client_id": c.client_id,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in convos
    ]
