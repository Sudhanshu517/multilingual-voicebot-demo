# SachAI - Battery Smart EV Driver Assistant

A conversational AI assistant for Battery Smart EV drivers with voice and text chat capabilities, built with React frontend and Python Flask backend.

## 🚀 Features

### 🎯 Core Functionality
- **Bilingual Support**: Hindi-English mixed conversations
- **Voice Chat**: Real-time voice streaming with automatic speech recognition
- **Text Chat**: Traditional text-based conversations
- **Intent Classification**: Smart query routing using sentence transformers
- **Conversation Memory**: Context-aware responses with session management
- **Sentiment Analysis**: Automatic handoff to human agents for negative sentiment

### 📱 User Interface
- **Modern Dashboard**: Clean, responsive design with dark/light themes
- **Battery Status**: Real-time battery level and range monitoring
- **Leave Management**: Track leave balance and penalties
- **Station Finder**: Locate nearest battery swapping stations
- **Support Integration**: Seamless handoff to human agents

### 🔧 Technical Features
- **Real-time Audio Streaming**: WebSocket-based voice communication
- **Speech Recognition**: Google Speech-to-Text integration
- **Text-to-Speech**: ElevenLabs voice synthesis
- **AI Processing**: Groq LLM for natural language understanding
- **Data Integration**: Excel-based mock data for driver information

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Voice Recording (MediaRecorder API)
├── Real-time Chat (SocketIO)
├── Audio Playback (Web Audio API)
└── UI Components (Tailwind CSS)

Backend (Python Flask)
├── Voice Server (Flask-SocketIO)
├── Speech Recognition (Google STT)
├── Intent Classification (Sentence Transformers)
├── AI Processing (Groq LLM)
├── Text-to-Speech (ElevenLabs)
└── Data Services (Excel/Pandas)
```

## 📋 Prerequisites

### Backend Requirements
- Python 3.8+
- pip package manager
- Microphone access for voice features

### Frontend Requirements
- Node.js 16+
- npm or yarn
- Modern web browser with WebRTC support

### API Keys Required
- **Groq API Key**: For LLM processing
- **ElevenLabs API Key**: For text-to-speech

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Testing
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_BACKEND_URL=http://localhost:5000
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
python voice_server.py
```
Server runs on: `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## 💬 Usage

### Text Chat
1. Navigate to **Chatbot** section
2. Type your query in Hindi or English
3. Get instant responses with audio playback

### Voice Chat
1. Go to **Web Call** section
2. Click "Start Voice Call"
3. Speak naturally - no button pressing needed
4. AI responds with voice and text

### Supported Queries
- **Battery Information**: "Mujhe battery chahiye"
- **Leave Queries**: "Mera leave balance kya hai?"
- **Penalty Information**: "Penalty kitna hai?"
- **Station Finder**: "Nearest station kahan hai?"
- **Subscription Status**: "Mera plan kya hai?"

## 🔧 Configuration

### Voice Settings
- **Recording Chunks**: 4-second audio segments
- **Audio Format**: WebM → WAV conversion
- **Speech Language**: English (with Hindi support)
- **Voice Model**: ElevenLabs multilingual

### AI Configuration
- **Intent Threshold**: 0.5 confidence score
- **Context Memory**: Last 10 messages
- **Sentiment Threshold**: -0.6 for human handoff
- **Response Length**: Max 50 tokens

## 📁 Project Structure

```
Testing/
├── backend/
│   ├── voice_server.py      # Main Flask server with SocketIO
│   ├── app.py              # Core chatbot logic
│   ├── asr.py              # Speech recognition utilities
│   ├── tts.py              # Text-to-speech integration
│   ├── swap.py             # Battery swap data service
│   ├── near.py             # Station finder service
│   ├── subs.py             # Subscription data service
│   ├── leave.py            # Leave management service
│   ├── prompts.py          # AI prompts and templates
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── sections/
│   │   │   ├── Chatbot.tsx     # Text chat interface
│   │   │   ├── WebCall.tsx     # Voice chat interface
│   │   │   ├── Dashboard.tsx   # Main dashboard
│   │   │   └── ...
│   │   ├── components/ui/      # Reusable UI components
│   │   └── App.tsx            # Main application
│   ├── package.json           # Node dependencies
│   └── index.html            # Entry point
└── README.md
```

## 🔍 API Endpoints

### HTTP Endpoints
- `POST /voice-chat` - Process voice messages
- `POST /text-chat` - Process text messages

### WebSocket Events
- `audio_stream` - Real-time audio streaming
- `transcription` - Speech-to-text results
- `ai_response` - AI responses with audio

## 🎯 Key Components

### Intent Classification
Uses sentence transformers to classify user intents:
- `swap_history` - Battery swap information
- `nearest_station` - Station finder
- `subscription_status` - Plan details
- `leave_info` - Leave management
- `open_talk` - General conversation
- `handoff` - Human agent transfer

### Conversation Memory
- Session-based context storage
- Sentiment tracking over time
- Automatic cleanup after 10 messages

### Voice Processing Pipeline
1. **Audio Capture** → MediaRecorder API
2. **Format Conversion** → WebM to WAV
3. **Speech Recognition** → Google STT
4. **Intent Classification** → Sentence Transformers
5. **AI Processing** → Groq LLM
6. **Response Generation** → ElevenLabs TTS
7. **Audio Playback** → Web Audio API

## 🚨 Troubleshooting

### Common Issues

**Voice not working:**
- Check microphone permissions
- Ensure SocketIO connection is established
- Verify audio format conversion (pydub installed)

**API errors:**
- Verify API keys in `.env` files
- Check network connectivity
- Ensure backend server is running

**Audio playback issues:**
- Check browser audio permissions
- Verify ElevenLabs API quota
- Test with different browsers

### Debug Mode
Enable debug logging:
```bash
# Backend
export FLASK_DEBUG=1
python voice_server.py

# Frontend
npm run dev -- --debug
```

## 🔐 Security Notes

- API keys stored in environment variables
- No sensitive data in client-side code
- Session-based conversation isolation
- Input validation on all endpoints

## 🚀 Deployment

### Backend Deployment
- Use production WSGI server (Gunicorn)
- Set environment variables for API keys
- Configure CORS for production domain

### Frontend Deployment
- Build production bundle: `npm run build`
- Set `VITE_BACKEND_URL` to production API
- Deploy to static hosting (Vercel, Netlify)

## 📈 Performance

- **Response Time**: < 2 seconds for voice queries
- **Audio Latency**: < 500ms for TTS playback
- **Memory Usage**: ~100MB backend, ~50MB frontend
- **Concurrent Users**: Supports multiple simultaneous sessions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check troubleshooting section above

---

**Built with ❤️ for Battery Smart EV drivers**