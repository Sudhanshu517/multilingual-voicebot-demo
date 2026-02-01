# SachAI Voice Chat Integration

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Make sure your `.env` file has the required API keys:
   ```
   GROQ_API_KEY=your_groq_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. Start the voice server:
   ```
   python voice_server.py
   ```
   Or double-click `start_server.bat`

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Features

### Voice Chat
- Click the microphone button to start recording
- Speak your query
- Click the microphone button again to stop recording
- The system will:
  1. Convert your speech to text
  2. Process the query using your existing chatbot logic
  3. Generate a text response
  4. Convert the response to speech
  5. Play the audio response automatically

### Text Chat
- Type your message and press Enter or click Send
- The system will:
  1. Process your text query
  2. Generate a response
  3. Convert the response to speech and play it

## API Endpoints

### POST /voice-chat
- Accepts audio file and driver information
- Returns transcribed text, response text, and audio response

### POST /text-chat
- Accepts text query and driver information
- Returns response text and audio response

## Browser Permissions
- The frontend will request microphone permissions for voice recording
- Make sure to allow microphone access when prompted

## Troubleshooting
- If voice recording doesn't work, check browser microphone permissions
- If audio playback doesn't work, check browser audio permissions
- Make sure the backend server is running on port 5000
- Check browser console for any error messages