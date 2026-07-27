import os
import json
from openai import OpenAI
from memory.engine import MemoryEngine
from voice.tts import synthesize_speech
from voice.stt import transcribe_audio
from ai.agents.system_agent import SystemAgent
from ai.agents.navigation_agent import NavigationAgent
from ai.agents.business_agent import BusinessAgent

class BrainEngine:
    def __init__(self):
        self.memory = MemoryEngine()
        self.system = SystemAgent()
        self.nav = NavigationAgent()
        self.biz = BusinessAgent()
        
        # Initialize OpenAI (Requires OPENAI_API_KEY in environment or .env)
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            print("[Warning] OPENAI_API_KEY not found. Operating in fallback/mock mode.")

    def _get_tools(self):
        """Define the tools available to the AI."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "open_application",
                    "description": "Opens a local application like VS Code, Chrome, Terminal.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "app_name": {"type": "string", "description": "Name of the app (e.g., 'code', 'chrome')"}
                        },
                        "required": ["app_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "navigate_ui",
                    "description": "Navigates the AI OS UI to a different page.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "page": {"type": "string", "description": "Page name (e.g., 'dashboard', 'clients', 'whatsapp')"}
                        },
                        "required": ["page"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "query_business_data",
                    "description": "Queries the business database for clients, revenue, or approvals.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query_type": {"type": "string", "enum": ["clients", "revenue", "approvals", "whatsapp"]}
                        },
                        "required": ["query_type"]
                    }
                }
            }
        ]

    def _fallback_process(self, text: str) -> dict:
        """A simple keyword-based fallback if OpenAI is not configured."""
        text = text.lower()
        response_text = ""
        action = None
        
        if "open vs code" in text or "open code" in text:
            action = self.system.open_application("code")
            response_text = "Opening Visual Studio Code for you, sir."
        elif "open chrome" in text or "open browser" in text:
            action = self.system.open_application("chrome")
            response_text = "Opening Google Chrome."
        elif "clients" in text:
            action = self.nav.navigate_to("clients")
            info = self.biz.get_client_count()
            response_text = f"Navigating to clients. {info}"
        elif "revenue" in text:
            info = self.biz.get_todays_revenue()
            response_text = info
        elif "whatsapp" in text or "messages" in text:
            action = self.nav.navigate_to("whatsapp")
            info = self.biz.get_whatsapp_unread()
            response_text = f"Opening WhatsApp. {info}"
        else:
            response_text = "I heard you, but I am in offline mode without my API key."
            
        return {"text": response_text, "action": action}

    def process_text_input(self, text: str) -> dict:
        """Process text input, make decisions via LLM or fallback, and return response."""
        self.memory.add_message(role='user', content=text)

        if not self.client:
            result = self._fallback_process(text)
            ai_response = result["text"]
            action_log = result["action"]
        else:
            # 1. Fetch Context
            history = list(self.memory.get_recent_history(5))
            messages = [{"role": "system", "content": "You are a highly capable AI Executive Assistant. You control the user's PC and business OS. Be concise, professional, and friendly. Address the user as 'Sir' or 'Sandeep Sir'."}]
            for role, content in history:
                messages.append({"role": role, "content": content})
            messages.append({"role": "user", "content": text})

            # 2. Call LLM with Tools
            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    tools=self._get_tools(),
                    tool_choice="auto"
                )
                
                message = response.choices[0].message
                ai_response = message.content or ""
                action_log = None

                # 3. Handle Tool Calls
                if message.tool_calls:
                    for tool_call in message.tool_calls:
                        func_name = tool_call.function.name
                        args = json.loads(tool_call.function.arguments)
                        
                        if func_name == "open_application":
                            action_log = self.system.open_application(args["app_name"])
                            if not ai_response: ai_response = f"Opening {args['app_name']}."
                        elif func_name == "navigate_ui":
                            action_log = self.nav.navigate_to(args["page"])
                            if not ai_response: ai_response = f"Navigating to {args['page']}."
                        elif func_name == "query_business_data":
                            qt = args["query_type"]
                            if qt == "clients": action_log = self.biz.get_client_count()
                            elif qt == "revenue": action_log = self.biz.get_todays_revenue()
                            elif qt == "approvals": action_log = self.biz.get_pending_approvals()
                            elif qt == "whatsapp": action_log = self.biz.get_whatsapp_unread()
                            
                            # Do a second pass to summarize the data (omitted for speed, we'll just append it)
                            if not ai_response: ai_response = action_log
                            else: ai_response += f" {action_log}"

            except Exception as e:
                print(f"[Error] LLM Call failed: {e}")
                res = self._fallback_process(text)
                ai_response = res["text"]
                action_log = res["action"]

        # 4. Save Response
        self.memory.add_message(role='ai', content=ai_response)

        # 5. TTS
        audio_file = synthesize_speech(ai_response)
        
        return {
            "text": ai_response,
            "action": action_log,
            "audio": audio_file
        }

    def process_audio_input(self, audio_path: str) -> dict:
        text = transcribe_audio(audio_path)
        return self.process_text_input(text)
