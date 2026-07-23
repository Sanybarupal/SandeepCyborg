import json
from ai.brain import _openai_client, _mock_response
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
    Process an incoming WhatsApp message, extract client info, and generate a reply.
    """
    # ─── Mock Mode ─────────────────────────────────
    if AI_MOCK_MODE or not _openai_client:
        reply = _mock_response(user_message, client_context)
        return {
            "extracted_info": {},
            "reply_message": reply
        }

    # ─── Real GPT-4 Mode ───────────────────────────
    try:
        messages = [{"role": "system", "content": WHATSAPP_SYSTEM_PROMPT}]
        
        # Add client context
        context_str = f"CURRENT KNOWN DETAILS:\n{json.dumps(client_context, indent=2)}\n\n"
        context_str += "Aapko in known details ko overwrite nahi karna hai agar nayi details na milein."
        messages.append({"role": "system", "content": context_str})

        # Add history
        for msg in history[-10:]:
            role = "user" if msg["role"] == "user" else "assistant"
            # Ignore non user/assistant roles or wrap them
            messages.append({"role": role, "content": msg["content"]})
            
        messages.append({"role": "user", "content": user_message})

        completion = _openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        response_text = completion.choices[0].message.content
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
