from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import speech_recognition as sr
import io
import wave
import tempfile
import os
from elevenlabs import stream
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
from app import process_query

load_dotenv()

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)