from fastapi import APIRouter, Depends, BackgroundTasks, Request, HTTPException
from sqlalchemy.orm import Session
from database import get_db, Client, Conversation, ClientStatus, Platform, SystemSetting
from ai.whatsapp_agent import process_whatsapp_message
import requests
import json
from datetime import datetime

router = APIRouter(tags=["WhatsApp"])

NODE_SERVICE_URL = "http://localhost:3005"

def send_whatsapp_message(to: str, message: str):
    """Call the Node.js service to send a message."""
    try:
        res = requests.post(f"{NODE_SERVICE_URL}/send", json={"to": to, "message": message})
        if res.status_code == 200:
            return True
        print(f"Failed to send WA message: {res.text}")
    except Exception as e:
        print(f"Error calling WA service: {e}")
    return False

@router.get("/whatsapp/status")
async def get_whatsapp_status(db: Session = Depends(get_db)):
    """Return actual WhatsApp connection status from Node service."""
    try:
        res = requests.get(f"{NODE_SERVICE_URL}/status")
        if res.status_code == 200:
            data = res.json()
            # Ensure DB setting reflects reality
            setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_connected").first()
            if not setting:
                setting = SystemSetting(key="whatsapp_connected", value=str(data.get("ready", False)).lower())
                db.add(setting)
            else:
                setting.value = str(data.get("ready", False)).lower()
            db.commit()
            return data
    except Exception as e:
        print(f"Error fetching WA status: {e}")
    return {"ready": False, "qr": None, "error": "Node service offline"}

def process_webhook_background(payload: dict, db: Session):
    """Background task to process the incoming webhook."""
    phone = payload.get("from")
    if not phone:
        return
        
    # Clean phone number
    clean_phone = phone.replace("@c.us", "")
    
    # Get or create client
    client = db.query(Client).filter(Client.phone == clean_phone).first()
    if not client:
        client = Client(
            phone=clean_phone,
            name="Unknown Client",
            platform=Platform.whatsapp,
            status=ClientStatus.new_lead
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        
    # Save user message
    user_msg_content = payload.get("body", "")
    if user_msg_content:
        user_conv = Conversation(
            client_id=client.id,
            role="user",
            content=user_msg_content,
            platform=Platform.whatsapp
        )
        db.add(user_conv)
        db.commit()

    # Check if AI is enabled globally
    ai_status = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_ai_enabled").first()
    if ai_status and ai_status.value == "false":
        return

    # Check if AI is paused for this specific client
    if client.ai_paused:
        return

    # Build context for AI
    client_context = {
        "name": client.name,
        "company": client.company,
        "email": client.email,
        "requirement": client.requirement,
        "budget": client.budget,
        "timeline": client.timeline,
        "status": client.status
    }
    
    history_records = db.query(Conversation).filter(
        Conversation.client_id == client.id
    ).order_by(Conversation.created_at.desc()).limit(10).all()
    history = [{"role": h.role, "content": h.content} for h in reversed(history_records)]

    # Call AI agent
    ai_response = process_whatsapp_message(user_msg_content, client_context, history)
    
    # Update Client if new info was extracted
    extracted = ai_response.get("extracted_info", {})
    updated = False
    for key in ["name", "company", "email", "requirement", "budget", "timeline"]:
        val = extracted.get(key)
        if val and val != "null" and val != "":
            setattr(client, key, val)
            updated = True
            
    if updated:
        if client.name != "Unknown Client" and client.requirement and client.status == ClientStatus.new_lead:
             client.status = ClientStatus.interested
        db.commit()
    
    reply_msg = ai_response.get("reply_message")
    
    # Send via WhatsApp Service
    if reply_msg:
        sent = send_whatsapp_message(phone, reply_msg)
        if sent:
            # Save AI response
            ai_conv = Conversation(
                client_id=client.id,
                role="ai",
                content=reply_msg,
                platform=Platform.whatsapp,
                is_sent=True
            )
            db.add(ai_conv)
            db.commit()


@router.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Webhook for Node.js service to send incoming messages."""
    try:
        payload = await request.json()
        background_tasks.add_task(process_webhook_background, payload, db)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/whatsapp/send")
async def send_manual_message(payload: dict, db: Session = Depends(get_db)):
    """Admin API to send a manual message."""
    client_id = payload.get("client_id")
    message = payload.get("message")
    
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client or not client.phone:
        raise HTTPException(status_code=404, detail="Client or phone not found")
        
    sent = send_whatsapp_message(f"{client.phone}@c.us", message)
    if sent:
        # Save to history
        conv = Conversation(
            client_id=client.id,
            role="system",
            content=message,
            platform=Platform.whatsapp,
            is_sent=True
        )
        db.add(conv)
        db.commit()
        return {"success": True}
    else:
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.get("/whatsapp/settings")
async def get_settings(db: Session = Depends(get_db)):
    ai_status = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_ai_enabled").first()
    return {"whatsapp_ai_enabled": (ai_status.value == "true") if ai_status else True}

@router.post("/whatsapp/settings")
async def update_settings(payload: dict, db: Session = Depends(get_db)):
    enabled = payload.get("whatsapp_ai_enabled")
    if enabled is not None:
        setting = db.query(SystemSetting).filter(SystemSetting.key == "whatsapp_ai_enabled").first()
        val = "true" if enabled else "false"
        if setting:
            setting.value = val
        else:
            setting = SystemSetting(key="whatsapp_ai_enabled", value=val)
            db.add(setting)
        db.commit()
    return {"success": True}

@router.post("/whatsapp/sync-chats")
async def sync_whatsapp_chats(db: Session = Depends(get_db)):
    """Sync recent chats from the running Node.js service."""
    try:
        res = requests.get(f"{NODE_SERVICE_URL}/chats")
        if res.status_code != 200:
            return {"success": False, "error": "Failed to fetch from Node service"}
            
        real_chats = res.json().get("chats", [])
        synced_count = 0
        for chat in real_chats:
            phone = chat.get("number")
            name = chat.get("name")
            clean_phone = phone.replace("@c.us", "") if phone else ""
            if not clean_phone:
                continue
            
            client = db.query(Client).filter(Client.phone == clean_phone).first()
            if not client:
                client = Client(
                    phone=clean_phone,
                    name=name or "Unknown",
                    platform=Platform.whatsapp,
                    status=ClientStatus.new_lead
                )
                db.add(client)
                db.commit()
                db.refresh(client)
                
            session_id = f"wa_{clean_phone}"
            messages = chat.get("messages", [])
            if messages:
                # Clear existing to avoid duplicates when re-syncing
                db.query(Conversation).filter(Conversation.session_id == session_id).delete()
                for m in messages:
                    role = "ai" if m.get("fromMe") else "user"
                    conv = Conversation(
                        client_id=client.id,
                        role=role,
                        content=m.get("body", ""),
                        platform=Platform.whatsapp,
                        session_id=session_id,
                        is_sent=m.get("fromMe")
                    )
                    if m.get("timestamp"):
                        conv.created_at = datetime.fromtimestamp(m["timestamp"])
                    db.add(conv)
                db.commit()
            synced_count += 1
            
        return {"success": True, "synced_count": synced_count}
    except Exception as e:
        print(f"Error syncing chats: {e}")
        return {"success": False, "error": str(e)}
