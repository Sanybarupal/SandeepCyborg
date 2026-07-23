"""
Sandeep Clone — Database Setup
SQLAlchemy with all models defined here.
"""
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float, Enum as SAEnum
from sqlalchemy.orm import declarative_base, sessionmaker
from config import DATABASE_URL
import enum

# ─── Engine & Session ──────────────────────────────
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Enums ─────────────────────────────────────────
class ClientStatus(str, enum.Enum):
    new_lead = "new_lead"
    interested = "interested"
    meeting_booked = "meeting_booked"
    proposal_sent = "proposal_sent"
    project_started = "project_started"
    completed = "completed"

class Platform(str, enum.Enum):
    whatsapp = "whatsapp"
    email = "email"
    linkedin = "linkedin"
    instagram = "instagram"
    facebook = "facebook"
    twitter = "twitter"
    direct = "direct"

class ApprovalType(str, enum.Enum):
    send_message = "send_message"
    bulk_message = "bulk_message"
    import_clients = "import_clients"
    github_push = "github_push"
    vercel_deploy = "vercel_deploy"
    send_proposal = "send_proposal"
    make_call = "make_call"
    other = "other"

class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class ProjectStatus(str, enum.Enum):
    brief = "brief"
    approved = "approved"
    in_progress = "in_progress"
    review = "review"
    deployed = "deployed"
    completed = "completed"


# ─── Models ────────────────────────────────────────

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    company = Column(String(100))
    email = Column(String(100))
    requirement = Column(Text)
    budget = Column(String(100))      # Added in Phase 2
    timeline = Column(String(100))    # Added in Phase 2
    platform = Column(String(30), default=Platform.direct)
    status = Column(String(30), default=ClientStatus.new_lead)
    tags = Column(String(200))  # comma-separated
    notes = Column(Text)
    ai_paused = Column(Boolean, default=False)
    last_contact = Column(DateTime)
    next_followup = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(String(500), nullable=False)



class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=True)  # None = general chat with Sandeep
    role = Column(String(10), nullable=False)    # 'user' | 'ai' | 'system'
    content = Column(Text, nullable=False)
    platform = Column(String(30), default=Platform.direct)
    session_id = Column(String(100))             # group messages in sessions
    is_sent = Column(Boolean, default=False)     # for client messages
    created_at = Column(DateTime, default=datetime.utcnow)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    payload = Column(Text)               # JSON string of action data
    status = Column(String(20), default=ApprovalStatus.pending)
    priority = Column(String(10), default="normal")  # low | normal | high
    client_id = Column(Integer, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    status = Column(String(30), default=ProjectStatus.brief)
    tech_stack = Column(String(200))
    github_url = Column(String(300))
    vercel_url = Column(String(300))
    live_url = Column(String(300))
    deadline = Column(DateTime, nullable=True)
    budget = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text)
    type = Column(String(30), default="info")   # info | warning | success | error
    is_read = Column(Boolean, default=False)
    link = Column(String(300))
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Init ──────────────────────────────────────────

def init_db():
    """Create all tables and seed initial data."""
    Base.metadata.create_all(bind=engine)

    # Seed sample clients if DB is empty
    db = SessionLocal()
    try:
        if db.query(Client).count() == 0:
            sample_clients = [
                Client(name="Rahul Sharma", phone="+91 9876543210", company="TechStartup Pvt Ltd",
                       email="rahul@techstartup.com", requirement="Portfolio website chahiye",
                       platform="whatsapp", status="lead", tags="website,portfolio"),
                Client(name="Priya Singh", phone="+91 8765432109", company="Fashion House",
                       email="priya@fashionhouse.in", requirement="E-commerce website",
                       platform="instagram", status="active", tags="ecommerce,fashion"),
                Client(name="Amit Kumar", phone="+91 7654321098", company="Self Employed",
                       email="amit@gmail.com", requirement="Business website + SEO",
                       platform="linkedin", status="lead", tags="business,seo"),
            ]
            db.add_all(sample_clients)

            # Seed sample notifications
            notifs = [
                Notification(title="Naya Client!", message="Rahul Sharma ne WhatsApp par message kiya", type="info"),
                Notification(title="Approval Pending", message="3 messages approve karne hain", type="warning"),
                Notification(title="Welcome!", message="Sandeep Clone AI System ready hai", type="success"),
            ]
            db.add_all(notifs)
            db.commit()
    finally:
        db.close()


def get_db():
    """FastAPI dependency for DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
