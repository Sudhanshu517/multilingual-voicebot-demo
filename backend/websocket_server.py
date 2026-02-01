import asyncio
import websockets
import json
import base64
import speech_recognition as sr
import tempfile
import os
from app import process_query
from elevenlabs import stream
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

elevenlabs = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

async def handle_voice_stream(websocket, path):
    print("Client connected to voice stream")
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            if data['type'] == 'audio':
                # Decode base64 audio
                audio_data = base64.b64decode(data['data'].split(',')[1])
                user_id = data['userId']
                
                # Save to temp file for speech recognition
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    temp_file.write(audio_data)
                    temp_file_path = temp_file.name
                
                try:
                    # Speech recognition
                    recognizer = sr.Recognizer()
                    with sr.AudioFile(temp_file_path) as source:
                        audio = recognizer.record(source)
                        text = recognizer.recognize_google(audio)
                        
                        print(f"Recognized: {text}")
                        
                        # Send transcription
                        await websocket.send(json.dumps({
                            'type': 'transcription',
                            'text': text
                        }))
                        
                        # Process with your existing logic
                        response, should_end = process_query(user_id, text, user_id)
                        print(f"Response: {response}")
                        
                        # Generate TTS
                        audio_stream = elevenlabs.text_to_speech.stream(
                            text=response,
                            voice_id="cgSgspJ2msm6clMCkdW9",
                            model_id="eleven_multilingual_v2"
                        )
                        
                        # Convert to base64
                        audio_bytes = b''.join(audio_stream)
                        audio_base64 = base64.b64encode(audio_bytes).decode()
                        
                        # Send response
                        await websocket.send(json.dumps({
                            'type': 'response',
                            'text': response,
                            'audio': f'data:audio/mpeg;base64,{audio_base64}'
                        }))
                        
                except sr.UnknownValueError:
                    print("No speech detected")
                except sr.RequestError as e:
                    print(f"Speech recognition error: {e}")
                finally:
                    os.unlink(temp_file_path)
                    
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Starting WebSocket voice server on ws://localhost:8000")
    start_server = websockets.serve(handle_voice_stream, "localhost", 8000)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()