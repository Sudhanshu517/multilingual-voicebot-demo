from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import speech_recognition as sr
import io
import wave
import tempfile
import os
import base64
import json
from elevenlabs import stream
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from app import process_query

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize ElevenLabs
elevenlabs = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    try:
        # Get audio data and user info from request
        audio_data = request.files.get('audio')
        driver_id = request.form.get('driver_id', 'default')
        session_id = request.form.get('session_id', driver_id)
        
        if not audio_data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Convert audio to text using speech recognition
        recognizer = sr.Recognizer()
        
        # Save uploaded audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_data.save(temp_audio.name)
            
            # Recognize speech
            with sr.AudioFile(temp_audio.name) as source:
                audio = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio)
                except sr.UnknownValueError:
                    return jsonify({'error': 'Could not understand audio'}), 400
                except sr.RequestError as e:
                    return jsonify({'error': f'Speech recognition error: {e}'}), 500
        
        # Clean up temp file
        os.unlink(temp_audio.name)
        
        # Process the query using existing logic
        response_text, should_end = process_query(driver_id, text, session_id)
        
        # Generate audio response
        audio_stream = elevenlabs.text_to_speech.stream(
            text=response_text,
            voice_id="cgSgspJ2msm6clMCkdW9",
            model_id="eleven_multilingual_v2"
        )
        
        # Convert stream to bytes
        audio_bytes = b''.join(audio_stream)
        
        return jsonify({
            'text_input': text,
            'text_response': response_text,
            'audio_response': audio_bytes.hex(),  # Convert to hex for JSON transport
            'should_end': should_end
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/text-chat', methods=['POST'])
def text_chat():
    try:
        data = request.json
        query = data.get('query', '')
        driver_id = data.get('driver_id', 'default')
        session_id = data.get('session_id', driver_id)
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Process the query
        response_text, should_end = process_query(driver_id, query, session_id)
        
        # Generate audio response
        audio_stream = elevenlabs.text_to_speech.stream(
            text=response_text,
            voice_id="cgSgspJ2msm6clMCkdW9",
            model_id="eleven_multilingual_v2"
        )
        
        audio_bytes = b''.join(audio_stream)
        
        return jsonify({
            'text_response': response_text,
            'audio_response': audio_bytes.hex(),
            'should_end': should_end
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# WebSocket handlers for real-time audio
@socketio.on('audio_stream')
def handle_audio_stream(data):
    try:
        user_id = data['userId']
        
        # Check if this is a welcome message request
        if data.get('isWelcome', False):
            # Generate welcome message
            response = f"Namaste {user_id}! Main SachAI hoon. Aapki kaise madad kar sakta hoon today?"
            
            # Generate TTS for welcome
            audio_stream = elevenlabs.text_to_speech.stream(
                text=response,
                voice_id="cgSgspJ2msm6clMCkdW9",
                model_id="eleven_multilingual_v2"
            )
            
            audio_bytes = b''.join(audio_stream)
            audio_base64 = base64.b64encode(audio_bytes).decode()
            
            emit('ai_response', {
                'text': response,
                'audio': f'data:audio/mpeg;base64,{audio_base64}',
                'shouldEnd': False
            })
            return
        
        # Decode base64 audio
        audio_data = base64.b64decode(data['data'].split(',')[1])
        
        # Create a proper WAV file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_webm:
            temp_webm.write(audio_data)
            temp_webm_path = temp_webm.name
        
        # Convert WebM to WAV using pydub
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_file(temp_webm_path)
            wav_path = temp_webm_path.replace('.webm', '.wav')
            audio.export(wav_path, format='wav')
            
            # Speech recognition
            recognizer = sr.Recognizer()
            with sr.AudioFile(wav_path) as source:
                audio_sr = recognizer.record(source)
                text = recognizer.recognize_google(audio_sr)
                
                print(f"Recognized: {text}")
                
                # Send transcription
                emit('transcription', {'text': text})
                
                # Process with existing logic
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
                emit('ai_response', {
                    'text': response,
                    'audio': f'data:audio/mpeg;base64,{audio_base64}',
                    'shouldEnd': should_end
                })
                
            os.unlink(wav_path)
                
        except Exception as e:
            print(f"Audio conversion error: {e}")
            # Fallback: try direct processing
            try:
                recognizer = sr.Recognizer()
                audio_sr = sr.AudioData(audio_data, 48000, 2)
                text = recognizer.recognize_google(audio_sr)
                emit('transcription', {'text': text})
            except:
                print("No speech detected")
        finally:
            os.unlink(temp_webm_path)
            
    except Exception as e:
        print(f"Error processing audio: {e}")
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)