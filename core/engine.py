from memory.engine import MemoryEngine
from voice.tts import synthesize_speech
from voice.stt import transcribe_audio

class CoreEngine:
    def __init__(self):
        self.memory = MemoryEngine()

    def process_text_input(self, text: str) -> str:
        """Process text input, update memory, and return an AI response."""
        # 1. Save User Input to DB
        self.memory.add_message(role='user', content=text)

        # 2. Generate AI Response (Mock for now, normally calls ChatGPT/Claude API)
        ai_response = f"I have processed your message: {text}"
        
        # 3. Save AI Response to DB
        self.memory.add_message(role='ai', content=ai_response)

        # 4. Trigger TTS
        audio_file = synthesize_speech(ai_response)
        print(f"[Core] Synthesized speech saved to {audio_file}")

        return ai_response

    def process_audio_input(self, audio_path: str) -> str:
        """Transcribe audio, process it, and return an AI response."""
        text = transcribe_audio(audio_path)
        return self.process_text_input(text)
