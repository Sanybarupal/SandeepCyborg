import json
from ai.brain import _genai_client, _mock_response
from config import AI_MODEL, AI_MOCK_MODE
from datetime import datetime

# Prompt to extract details and generate a reply
WHATSAPP_SYSTEM_PROMPT = """
Aap Sandeep Barupal (SanjeevAI) ke AI assistant hain. 
Aapka kaam WhatsApp par clients se baat karna aur unki requirements samajhna hai.
Aapko client se yeh details nikalni hain (agar abhi tak nahi mili):
- Name
- Company
- Requirement
- Budget
- Timeline
- Email

Aapko Har message par 2 cheezein karni hain:
1. JSON format mein extracted details deni hai.
2. Client ko reply dene ke liye message likhna hai (Hinglish mein, professional aur warm).

Agar koi detail nahi mili, toh use null set karein aur apne agle message mein naturally uske baare mein poochein (lekin ek saath sab mat poochna, conversational rehna).

RESPONSE FORMAT (Strict JSON string):
{
  "extracted_info": {
    "name": "...", 
    "company": "...",
    "email": "...",
    "requirement": "...",
    "budget": "...",
    "timeline": "..."
  },
  "reply_message": "Namaste! Aap kaise hain? ..."
}
"""

def process_whatsapp_message(user_message: str, client_context: dict, history: list) -> dict:
    """
    Process an incoming WhatsApp message, extract client info, and generate a reply using Gemini.
    """
    # ─── Mock Mode ─────────────────────────────────
    if AI_MOCK_MODE or not _genai_client:
        reply = _mock_response(user_message, client_context)
        return {
            "extracted_info": {},
            "reply_message": reply
        }

    # ─── Real Gemini Mode ───────────────────────────
    try:
        from google.genai import types
        
        messages = []
        
        # Add history
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            messages.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))
            
        messages.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))
        
        # Add client context to system instruction
        system_instruction = WHATSAPP_SYSTEM_PROMPT
        system_instruction += f"\n\nCURRENT KNOWN DETAILS:\n{json.dumps(client_context, indent=2)}\n\n"
        system_instruction += "Aapko in known details ko overwrite nahi karna hai agar nayi details na milein."

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            response_mime_type="application/json"
        )

        response = _genai_client.models.generate_content(
            model=AI_MODEL,
            contents=messages,
            config=config,
        )

        response_text = response.text
        parsed = json.loads(response_text)
        
        return {
            "extracted_info": parsed.get("extracted_info", {}),
            "reply_message": parsed.get("reply_message", "Main samajh nahi paaya. Kya aap thoda aur samjha sakte hain?")
        }

    except Exception as e:
        print(f"Error in process_whatsapp_message: {e}")
        return {
            "extracted_info": {},
            "reply_message": _mock_response(user_message, client_context)
        }
