from elevenlabs import stream
from elevenlabs.client import ElevenLabs
import os
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")
elevenlabs = ElevenLabs(api_key=API_KEY)

def speak_text(text):
    try:
        audio_stream = elevenlabs.text_to_speech.stream(
            text=text,
            voice_id="cgSgspJ2msm6clMCkdW9",  # Adam voice (free)
            model_id="eleven_multilingual_v2"
        )
        # play the streamed audio locally
        stream(audio_stream)
    except Exception as e:
        print(f"[TTS Error: {e}]")
        pass  # Continue without audio