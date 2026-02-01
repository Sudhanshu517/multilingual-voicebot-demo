import asyncio
import speech_recognition as sr
import io
import wave
import tempfile
from livekit.agents import JobContext, WorkerOptions, cli
from livekit import rtc
from dotenv import load_dotenv
from app import process_query
from tts import speak_text
import numpy as np

load_dotenv()

async def entrypoint(ctx: JobContext):
    await ctx.connect()
    print(f"✅ SachAI Agent Joined Room: {ctx.room.name}")

    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track: rtc.Track, publication: rtc.TrackPublication, participant: rtc.RemoteParticipant):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            print(f"🎤 Audio from {participant.identity}")
            asyncio.create_task(process_audio_stream(ctx, track, participant.identity))

async def process_audio_stream(ctx: JobContext, input_track: rtc.Track, user_id: str):
    audio_stream = rtc.AudioStream(input_track)
    recognizer = sr.Recognizer()
    
    # Create output source for TTS
    source = rtc.AudioSource(48000, 1)
    output_track = rtc.LocalAudioTrack.create_audio_track("ai_response", source)
    await ctx.room.local_participant.publish_track(output_track)
    
    audio_buffer = []
    
    async for event in audio_stream:
        frame = event.frame
        
        # Convert frame to numpy array
        audio_data = np.frombuffer(frame.data, dtype=np.int16)
        audio_buffer.extend(audio_data)
        
        # Process every 3 seconds of audio
        if len(audio_buffer) >= 48000 * 3:  # 3 seconds at 48kHz
            try:
                # Convert to wav format for speech recognition
                audio_array = np.array(audio_buffer, dtype=np.int16)
                
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    with wave.open(temp_file.name, 'wb') as wav_file:
                        wav_file.setnchannels(1)
                        wav_file.setsampwidth(2)
                        wav_file.setframerate(48000)
                        wav_file.writeframes(audio_array.tobytes())
                    
                    # Speech recognition
                    with sr.AudioFile(temp_file.name) as audio_source:
                        audio = recognizer.record(audio_source)
                        try:
                            text = recognizer.recognize_google(audio)
                            print(f"Recognized: {text}")
                            
                            # Process with your existing logic
                            response, should_end = process_query(user_id, text, user_id)
                            print(f"Response: {response}")
                            
                            # Generate TTS audio and stream back
                            # You'll need to modify speak_text to return audio data instead of playing
                            
                        except sr.UnknownValueError:
                            pass  # No speech detected
                        except sr.RequestError as e:
                            print(f"Speech recognition error: {e}")
                
                audio_buffer = []  # Clear buffer
                
            except Exception as e:
                print(f"Audio processing error: {e}")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))