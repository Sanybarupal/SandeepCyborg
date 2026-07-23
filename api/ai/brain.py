"""
Sandeep Clone — AI Brain
GPT-4o se connected. Aapki personality ke saath baat karta hai.
Agar OpenAI key nahi hai toh smart mock mode mein kaam karta hai.
"""
import json
import random
from datetime import datetime
from config import OPENAI_API_KEY, AI_MODEL, AI_MOCK_MODE
from ai.persona import SANDEEP_PERSONA, GREETING

# Try to import OpenAI
try:
    from openai import OpenAI
    _openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    _openai_client = None


# ─── Mock Responses (when no API key) ─────────────
MOCK_RESPONSES = [
    "Namaste! Aapka message mil gaya. Main Sanjeev ji ko inform kar deta hoon aur jald hi detail ke saath reply karunga.",
    "Ji zaroor! Aapki requirement samajh aayi. Kya aap thoda aur detail mein bata sakte hain ki aapko kya kya feature chahiye?",
    "Bilkul! Hum yeh kaam kar sakte hain. Main ek detailed proposal tayaar karta hoon. Kya main Sanjeev ji se confirm karke aapko bhaag 2-3 din mein bhej sakta hoon?",
    "Shukriya aapne contact karne ke liye! Aapki requirement note ho gayi hai. Main Sanjeev ji se baat karke aapko best solution suggest karunga.",
    "Achha! Yeh interesting project hai. Portfolio website ke liye humara 5-7 working days ka timeline hota hai. Budget 15,000 se 25,000 ke beech hoga depending on features.",
    "Main samajh gaya. Aapko ek professional website chahiye jo aapka brand represent kare. Main ek quick brief banata hoon, phir Sanjeev ji approve karenge toh kaam shuru karenge.",
]

def _mock_response(user_message: str, client_context: dict = None) -> str:
    """Smart mock response when no OpenAI key."""
    msg_lower = user_message.lower()

    if any(word in msg_lower for word in ["kya haal", "kaisa hai", "how are", "hello", "hi", "namaste"]):
        return GREETING

    if any(word in msg_lower for word in ["price", "cost", "kitna", "budget", "charge", "fees"]):
        return "Haan ji! Hamare packages 10,000 se start hote hain. Exact quote ke liye project ka scope batayein — main Sanjeev ji se confirm karke exact estimate dunga."

    if any(word in msg_lower for word in ["website", "site", "develop", "banao", "design"]):
        return "Website development ke liye hum available hain! Portfolio (3-5 pages) ka typical cost 12,000-18,000 aur timeline 5-7 din hota hai. Aapki specific requirements kya hain?"

    if any(word in msg_lower for word in ["contact", "call", "meet", "meeting"]):
        return "Zaroor! Main Sanjeev ji se time leke aapko meeting schedule karta hoon. Aap kab available hain — weekday ya weekend? Morning ya evening?"

    return random.choice(MOCK_RESPONSES)


def _build_context_messages(history: list, client: dict = None) -> list:
    """Build message list for OpenAI API."""
    messages = [{"role": "system", "content": SANDEEP_PERSONA}]

    if client:
        client_context = f"""
## Current Client Context:
- Name: {client.get('name', 'Unknown')}
- Company: {client.get('company', 'N/A')}
- Requirement: {client.get('requirement', 'N/A')}
- Status: {client.get('status', 'lead')}
- Platform: {client.get('platform', 'direct')}
"""
        messages.append({"role": "system", "content": client_context})

    # Add conversation history (last 10 messages)
    for msg in history[-10:]:
        role = "user" if msg["role"] == "user" else "assistant"
        messages.append({"role": role, "content": msg["content"]})

    return messages


def generate_response(
    user_message: str,
    history: list = None,
    client: dict = None
) -> dict:
    """
    Main function: Generate AI response.
    Returns dict with response text, mode, and metadata.
    """
    history = history or []

    # ─── Mock Mode ─────────────────────────────────
    if AI_MOCK_MODE or not _openai_client:
        response_text = _mock_response(user_message, client)
        return {
            "response": response_text,
            "mode": "mock",
            "model": "mock-hinglish-v1",
            "tokens_used": 0,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # ─── Real GPT-4 Mode ───────────────────────────
    try:
        messages = _build_context_messages(history, client)
        messages.append({"role": "user", "content": user_message})

        completion = _openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )

        response_text = completion.choices[0].message.content
        tokens = completion.usage.total_tokens if completion.usage else 0

        return {
            "response": response_text,
            "mode": "gpt4",
            "model": AI_MODEL,
            "tokens_used": tokens,
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        # Fallback to mock on error
        return {
            "response": _mock_response(user_message, client),
            "mode": "mock_fallback",
            "model": "mock",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }


def generate_personalized_message(client: dict, purpose: str = "follow_up") -> str:
    """Generate a personalized message for a specific client."""
    prompt = f"""
Client ke liye ek personalized message likho:
- Name: {client.get('name')}
- Company: {client.get('company', 'N/A')}
- Requirement: {client.get('requirement', 'N/A')}
- Purpose: {purpose}

Short, professional aur warm message likho (Hinglish mein, 2-3 sentences).
"""
    result = generate_response(prompt, history=[], client=client)
    return result["response"]


def summarize_conversation(messages: list) -> str:
    """Summarize a conversation thread."""
    if not messages:
        return "Koi conversation nahi mila."

    conversation_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
    prompt = f"Yeh conversation summarize karo (2-3 points mein, Hindi/Hinglish mein):\n\n{conversation_text}"

    result = generate_response(prompt)
    return result["response"]
