"""
Voice Microphone Module
Handles real-time audio capture with Voice Activity Detection (VAD).
"""

import sounddevice as sd
import numpy as np
import wave
import tempfile
import os
import time
import threading
from typing import Callable, Optional

try:
    import webrtcvad
    WEBRTCVAD_AVAILABLE = True
except ImportError:
    WEBRTCVAD_AVAILABLE = False

class MicrophoneCapture:
    """
    Captures audio from the microphone with Voice Activity Detection.
    Supports: continuous listening, push-to-talk, configurable silence detection.
    """

    SAMPLE_RATE = 16000   # Whisper needs 16kHz
    CHANNELS = 1
    CHUNK_DURATION_MS = 30  # VAD works in 10/20/30ms chunks
    CHUNK_SIZE = int(SAMPLE_RATE * CHUNK_DURATION_MS / 1000)
    FORMAT = np.int16

    def __init__(self, device_index: Optional[int] = None, aggressiveness: int = 2):
        """
        Args:
            device_index: Microphone device index (None = system default)
            aggressiveness: VAD aggressiveness 0-3 (3 = most aggressive noise filtering)
        """
        self.device_index = device_index
        self.is_recording = False
        self.is_listening = False
        self._stop_event = threading.Event()

        if WEBRTCVAD_AVAILABLE:
            self.vad = webrtcvad.Vad(aggressiveness)
        else:
            self.vad = None
            print("[Microphone] webrtcvad not available, using energy-based VAD")

    def _is_speech(self, chunk: bytes) -> bool:
        """Detect if audio chunk contains speech."""
        if self.vad:
            try:
                return self.vad.is_speech(chunk, self.SAMPLE_RATE)
            except Exception:
                pass
        # Fallback: energy-based detection
        audio = np.frombuffer(chunk, dtype=np.int16)
        rms = np.sqrt(np.mean(audio.astype(np.float32) ** 2))
        return rms > 500  # Threshold for speech energy

    def record_until_silence(
        self,
        silence_duration: float = 1.5,
        max_duration: float = 30.0,
        pre_speech_buffer: int = 5,
    ) -> Optional[str]:
        """
        Record audio until user stops speaking.
        Returns path to temp WAV file, or None if no speech detected.
        """
        print("[Mic] 🎤 Listening... (speak now)")

        chunks = []
        speech_chunks = []
        speech_detected = False
        silent_chunks = 0
        pre_buffer = []  # Keep some chunks before speech starts
        silence_threshold = int(silence_duration * 1000 / self.CHUNK_DURATION_MS)
        max_chunks = int(max_duration * 1000 / self.CHUNK_DURATION_MS)
        chunk_count = 0

        def audio_callback(indata, frames, time_info, status):
            nonlocal speech_detected, silent_chunks, chunk_count
            chunk = indata[:, 0].astype(np.int16).tobytes()
            is_speech = self._is_speech(chunk)

            if not speech_detected:
                pre_buffer.append(chunk)
                if len(pre_buffer) > pre_speech_buffer:
                    pre_buffer.pop(0)
                if is_speech:
                    speech_detected = True
                    speech_chunks.extend(pre_buffer)
                    speech_chunks.append(chunk)
                    print("[Mic] 🗣️  Speech detected")
            else:
                speech_chunks.append(chunk)
                if not is_speech:
                    silent_chunks += 1
                else:
                    silent_chunks = 0

            chunk_count += 1

        try:
            with sd.InputStream(
                samplerate=self.SAMPLE_RATE,
                channels=self.CHANNELS,
                dtype='int16',
                blocksize=self.CHUNK_SIZE,
                device=self.device_index,
                callback=audio_callback
            ):
                while not self._stop_event.is_set():
                    time.sleep(self.CHUNK_DURATION_MS / 1000)
                    # Stop if silence after speech
                    if speech_detected and silent_chunks >= silence_threshold:
                        print("[Mic] 🔇 Silence detected — processing...")
                        break
                    # Stop if max duration exceeded
                    if chunk_count >= max_chunks:
                        print("[Mic] ⏱️  Max duration reached")
                        break

        except Exception as e:
            print(f"[Mic] Error: {e}")
            return None

        if not speech_detected or len(speech_chunks) < 5:
            print("[Mic] No speech detected")
            return None

        return self._save_wav(speech_chunks)

    def record_push_to_talk(self, duration: float = 10.0) -> Optional[str]:
        """
        Record for a fixed duration (push-to-talk mode).
        Returns path to temp WAV file.
        """
        print(f"[Mic] 🔴 Recording for {duration}s...")
        chunks = []

        def callback(indata, frames, time_info, status):
            chunks.append(indata[:, 0].astype(np.int16).tobytes())

        with sd.InputStream(
            samplerate=self.SAMPLE_RATE,
            channels=self.CHANNELS,
            dtype='int16',
            blocksize=self.CHUNK_SIZE,
            device=self.device_index,
            callback=callback
        ):
            time.sleep(duration)

        print("[Mic] ✅ Recording complete")
        return self._save_wav(chunks) if chunks else None

    def _save_wav(self, chunks: list) -> str:
        """Save audio chunks to a temporary WAV file."""
        tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False, prefix='voice_')
        tmp_path = tmp.name
        tmp.close()

        with wave.open(tmp_path, 'wb') as wf:
            wf.setnchannels(self.CHANNELS)
            wf.setsampwidth(2)  # 16-bit = 2 bytes
            wf.setframerate(self.SAMPLE_RATE)
            wf.writeframes(b''.join(chunks))

        size_kb = os.path.getsize(tmp_path) / 1024
        print(f"[Mic] 💾 Saved audio: {tmp_path} ({size_kb:.1f} KB)")
        return tmp_path

    def stop(self):
        """Stop any ongoing recording."""
        self._stop_event.set()

    def list_devices(self) -> list:
        """List available microphone devices."""
        devices = sd.query_devices()
        mics = []
        for i, d in enumerate(devices):
            if d['max_input_channels'] > 0:
                mics.append({'index': i, 'name': d['name']})
        return mics


# ── Singleton ──
_microphone: Optional[MicrophoneCapture] = None

def get_microphone(device_index=None) -> MicrophoneCapture:
    global _microphone
    if _microphone is None:
        _microphone = MicrophoneCapture(device_index=device_index)
    return _microphone
