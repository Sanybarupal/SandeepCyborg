import time
import threading
from voice.tts import synthesize_speech

class ProactiveNotifier:
    """
    Background service that monitors the system and proactively 
    notifies the user via voice when important events occur.
    """
    def __init__(self):
        self.running = False
        self._thread = None

    def start(self):
        if not self.running:
            self.running = True
            self._thread = threading.Thread(target=self._loop, daemon=True)
            self._thread.start()
            print("[ProactiveNotifier] Started background monitoring.")

    def stop(self):
        self.running = False
        if self._thread:
            self._thread.join()
            print("[ProactiveNotifier] Stopped.")

    def _loop(self):
        # In a real scenario, this would subscribe to a Redis queue, 
        # WebSocket events, or poll the database for changes.
        # For demonstration, we simulate random proactive events.
        
        events_to_simulate = [
            "Sandeep Sir, Rahul sent a new WhatsApp message regarding the proposal.",
            "Sandeep Sir, the website deployment on Vercel completed successfully.",
            "Sandeep Sir, a payment of ₹45,000 was just received."
        ]
        
        event_idx = 0
        while self.running:
            time.sleep(120)  # Check every 2 minutes
            
            # Simulate an event occurring (e.g. grabbing from DB)
            if event_idx < len(events_to_simulate):
                event_text = events_to_simulate[event_idx]
                print(f"\n[Proactive Event Triggered] {event_text}")
                
                # Synthesize the audio so the frontend can play it
                synthesize_speech(event_text)
                
                # In the real app, this would push a WebSocket event to the client
                # to trigger playback of the generated audio.
                
                event_idx += 1
