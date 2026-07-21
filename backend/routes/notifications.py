"""
Notifications API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Notification
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def list_notifications(limit: int = 20, db: Session = Depends(get_db)):
    notifs = db.query(Notification).order_by(
        Notification.created_at.desc()
    ).limit(limit).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@router.post("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Read mark ho gaya"}


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "Sab notifications read mark ho gayi"}
