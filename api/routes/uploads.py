"""
File Upload API — CSV, Excel, PDF se clients import karna
"""
import io
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db, Client, ApprovalRequest, Notification

router = APIRouter(prefix="/upload", tags=["Upload"])


def parse_csv_excel(content: bytes, filename: str) -> list[dict]:
    """Parse CSV or Excel file and return list of client dicts."""
    try:
        import pandas as pd

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise ValueError("Sirf CSV ya Excel file allowed hai")

        # Normalize column names
        df.columns = [col.lower().strip().replace(" ", "_") for col in df.columns]

        # Map common column names
        col_map = {
            "client_name": "name",
            "client name": "name",
            "full_name": "name",
            "fullname": "name",
            "mobile": "phone",
            "mobile_number": "phone",
            "phone_number": "phone",
            "contact": "phone",
            "organisation": "company",
            "organization": "company",
            "firm": "company",
            "mail": "email",
            "e-mail": "email",
            "requirement": "requirement",
            "requirements": "requirement",
            "needs": "requirement",
            "project": "requirement",
        }
        df.rename(columns=col_map, inplace=True)

        clients = []
        for _, row in df.iterrows():
            client = {}
            for col in ["name", "phone", "company", "email", "requirement"]:
                val = row.get(col, "")
                if val and str(val).lower() not in ["nan", "none", ""]:
                    client[col] = str(val).strip()

            # Only add if has at least a name
            if client.get("name"):
                clients.append(client)

        return clients

    except Exception as e:
        raise ValueError(f"File parse error: {str(e)}")


def parse_pdf(content: bytes) -> list[dict]:
    """Extract text from PDF and try to find client info."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        # Return as single "client" with full text as requirement
        return [{
            "name": "PDF Import",
            "requirement": text[:500],
            "notes": f"Full PDF Content:\n{text[:2000]}",
        }]
    except Exception as e:
        raise ValueError(f"PDF parse error: {str(e)}")


@router.post("/clients")
async def upload_clients(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload CSV/Excel/PDF and create approval request for bulk import.
    Actual import happens only after approval.
    """
    content = await file.read()
    filename = file.filename.lower()

    # Parse file
    try:
        if filename.endswith(".pdf"):
            clients = parse_pdf(content)
        elif filename.endswith((".csv", ".xlsx", ".xls")):
            clients = parse_csv_excel(content, filename)
        else:
            raise HTTPException(
                status_code=400,
                detail="Sirf CSV, Excel (.xlsx/.xls) ya PDF file upload karein"
            )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if not clients:
        raise HTTPException(status_code=422, detail="File mein koi valid client data nahi mila")

    # Create approval request (don't import yet!)
    approval = ApprovalRequest(
        type="import_clients",
        title=f"{len(clients)} clients import karne hain — '{file.filename}'",
        description=f"File: {file.filename}\nTotal Clients: {len(clients)}\n\nPehle 3 clients:\n"
                    + "\n".join([f"• {c.get('name', '?')} — {c.get('company', 'N/A')}" for c in clients[:3]]),
        payload=json.dumps({
            "clients": clients,
            "filename": file.filename,
            "total": len(clients),
        }),
        priority="high",
    )
    db.add(approval)

    notif = Notification(
        title="File Upload Hua!",
        message=f"'{file.filename}' se {len(clients)} clients ready hain — Approve karen",
        type="warning",
        link="/approvals",
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"{len(clients)} clients file se parse ho gaye. Approval pending hai.",
        "clients_found": len(clients),
        "preview": clients[:5],
        "approval_id": approval.id,
        "status": "pending_approval",
    }


@router.post("/execute-import/{approval_id}")
def execute_import(approval_id: int, db: Session = Depends(get_db)):
    """
    Actually import clients after approval.
    Called when user approves the import request.
    """
    approval = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval nahi mili")
    if approval.status != "approved":
        raise HTTPException(status_code=400, detail="Pehle approve karein")

    payload = json.loads(approval.payload)
    clients_data = payload.get("clients", [])

    imported = 0
    skipped = 0
    for c in clients_data:
        # Check for duplicate by phone or email
        exists = False
        if c.get("phone"):
            exists = db.query(Client).filter(Client.phone == c["phone"]).first()
        if not exists and c.get("email"):
            exists = db.query(Client).filter(Client.email == c["email"]).first()

        if exists:
            skipped += 1
            continue

        client = Client(
            name=c.get("name", "Unknown"),
            phone=c.get("phone"),
            company=c.get("company"),
            email=c.get("email"),
            requirement=c.get("requirement"),
            notes=c.get("notes"),
            status="lead",
        )
        db.add(client)
        imported += 1

    notif = Notification(
        title="Import Complete!",
        message=f"{imported} clients import ho gaye, {skipped} already existed",
        type="success",
    )
    db.add(notif)
    db.commit()

    return {
        "message": f"Import complete! {imported} new clients add ho gaye.",
        "imported": imported,
        "skipped": skipped,
    }
