import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  MessageSquare,
  Bot,
  Sparkles
} from 'lucide-react'

interface WebCallProps {
  userName: string
  userId: string
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export function WebCall({ userName, userId }: WebCallProps) {
  const [isInCall, setIsInCall] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [conversation, setConversation] = useState<{type: 'ai' | 'user', text: string}[]>([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start call with SocketIO streaming
  const handleStartCall = async () => {
    try {
      setIsInCall(true)
      setIsProcessing(true)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
      
      // Check if SocketIO is available
      if (!(window as any).io) {
        throw new Error('SocketIO not loaded')
      }
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Connect to SocketIO
      const socket = (window as any).io(`${BACKEND_URL}`)
      
      socket.on('connect', () => {
        console.log('✅ Connected to voice stream')
        setIsListening(true)
        setIsProcessing(false)
        startAudioStreaming(stream, socket)
        
        // Send welcome message request
        setTimeout(() => {
          socket.emit('audio_stream', {
            data: 'data:audio/wav;base64,', // Empty audio to trigger welcome
            userId: userId,
            isWelcome: true
          })
        }, 1000)
      })
      
      socket.on('transcription', (data: any) => {
        setConversation(prev => [...prev, { type: 'user', text: data.text }])
      })
      
      socket.on('ai_response', (data: any) => {
        setConversation(prev => [...prev, { type: 'ai', text: data.text }])
        setIsAiSpeaking(true)
        setIsProcessing(false)
        
        if (data.audio && !isSpeakerOff) {
          playAudioFromBase64(data.audio)
        } else {
          setTimeout(() => setIsAiSpeaking(false), 2000)
        }
        
        // Check for call end
        if (data.shouldEnd) {
          setTimeout(() => handleEndCall(), 4000)
        }
      })
      
      socket.on('connect_error', (error: any) => {
        console.error('Socket connection failed:', error)
        setIsInCall(false)
        setIsProcessing(false)
        startContinuousListening()
      })
      
      setRoom({ socket, stream } as any)
      
    } catch (error) {
      console.error('Call start failed:', error)
      setIsInCall(false)
      setIsProcessing(false)
      // Fallback to speech recognition
      startContinuousListening()
    }
  }

  // End call
  const handleEndCall = () => {
    console.log('Ending call')
    setIsInCall(false)
    setCallDuration(0)
    setConversation([])
    setIsSpeakerOff(false)
    setIsListening(false)
    setIsProcessing(false)
    setIsAiSpeaking(false)
    
    if (recordingTimer) {
      clearTimeout(recordingTimer)
      setRecordingTimer(null)
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (room && room.socket) {
      room.socket.disconnect()
      if (room.stream) {
        room.stream.getTracks().forEach((track: any) => track.stop())
      }
      setRoom(null)
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.onended = null
      audioRef.current.onloadstart = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Audio streaming functions
  const startAudioStreaming = (stream: MediaStream, socket: any) => {
    const mediaRecorder = new MediaRecorder(stream)
    const audioChunks: BlobPart[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }
    
    mediaRecorder.onstop = () => {
      if (audioChunks.length > 0 && !isAiSpeaking && !isProcessing) {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const reader = new FileReader()
        reader.onload = () => {
          socket.emit('audio_stream', {
            data: reader.result,
            userId: userId
          })
        }
        reader.readAsDataURL(audioBlob)
      }
      audioChunks.length = 0
    }
    
    // Record only when conditions are met
    const scheduleRecording = () => {
      if (recordingTimer) {
        clearTimeout(recordingTimer)
      }
      
      const timer = setTimeout(() => {
        if (socket.connected && !isAiSpeaking && !isProcessing && mediaRecorder.state === 'inactive') {
          mediaRecorder.start()
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop()
            }
          }, 4000) // 4 second chunks
        }
        scheduleRecording()
      }, 1000)
      
      setRecordingTimer(timer)
    }
    
    scheduleRecording()
    setMediaRecorder(mediaRecorder)
  }
  
  const playAudioFromBase64 = (base64Audio: string) => {
    if (audioRef.current) {
      audioRef.current.src = base64Audio
      audioRef.current.onended = () => {
        setIsAiSpeaking(false)
      }
      audioRef.current.play()
    }
  }

  // Start continuous voice listening (like backend)
  const startContinuousListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognizer = new SpeechRecognition()
    
    recognizer.continuous = true
    recognizer.interimResults = false
    recognizer.lang = 'en-US'
    
    recognizer.onstart = () => {
      setIsListening(true)
      console.log('Voice recognition started')
    }
    
    recognizer.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim()
      console.log('Voice input received:', transcript)
      if (transcript && transcript.length > 0 && !isProcessing && !isAiSpeaking) {
        handleVoiceInput(transcript)
      }
    }
    
    recognizer.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        setTimeout(() => {
          if (isInCall && !isProcessing && !isAiSpeaking) {
            recognizer.start()
          }
        }, 1000)
      }
    }
    
    recognizer.onend = () => {
      console.log('Voice recognition ended')
      setIsListening(false)
      // Only restart if not processing, not AI speaking, and not during audio playback
      if (isInCall && !isProcessing && !isAiSpeaking && (!audioRef.current || audioRef.current.paused)) {
        console.log('Restarting voice recognition...')
        setTimeout(() => {
          if (isInCall && !isProcessing && !isAiSpeaking && (!audioRef.current || audioRef.current.paused)) {
            recognizer.start()
          }
        }, 2000)
      }
    }
    
    recognizer.start()
    setRecognition(recognizer)
  }
  
  // Handle voice input (like backend callback)
  const handleVoiceInput = async (text: string) => {
    console.log('Processing voice input:', text, 'isProcessing:', isProcessing)
    if (isProcessing || isAiSpeaking) {
      console.log('Ignoring input - already processing')
      return
    }
    
    if (text.toLowerCase().includes('exit') || text.toLowerCase().includes('goodbye')) {
      handleEndCall()
      return
    }
    
    setIsProcessing(true)
    
    // Stop listening immediately and prevent restart
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
    
    setConversation(prev => [...prev, { type: 'user', text }])
    setIsAiSpeaking(true)
    
    try {
      const response = await fetch(`${BACKEND_URL}/text-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, driver_id: userId, session_id: userId })
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setConversation(prev => [...prev, { type: 'ai', text: data.text_response }])
      
      // Play audio response
      if (data.audio_response && !isSpeakerOff && audioRef.current) {
        const bytes = new Uint8Array(data.audio_response.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)))
        const blob = new Blob([bytes], { type: 'audio/mpeg' })
        const audioUrl = URL.createObjectURL(blob)
        audioRef.current.src = audioUrl
        
        audioRef.current.onloadstart = () => {
          // Stop recognition as soon as audio starts loading
          if (recognition) {
            recognition.stop()
            setIsListening(false)
          }
        }
        
        audioRef.current.onended = () => {
          setIsAiSpeaking(false)
          setIsProcessing(false)
          // Wait 3 seconds after AI finishes speaking to avoid picking up echoes
          setTimeout(() => {
            if (isInCall && recognition && !isProcessing) {
              console.log('Restarting recognition after audio ended')
              recognition.start()
            }
          }, 3000)
        }
        
        audioRef.current.play()
      } else {
        setIsAiSpeaking(false)
        setIsProcessing(false)
        setTimeout(() => {
          if (isInCall && recognition && !isProcessing) {
            recognition.start()
          }
        }, 1000)
      }
      
    } catch (error) {
      console.error('Error:', error)
      setConversation(prev => [...prev, { type: 'ai', text: 'Sorry, I encountered an error. Please try again.' }])
      setIsAiSpeaking(false)
      setIsProcessing(false)
      setTimeout(() => {
        if (isInCall && recognition && !isProcessing) {
          recognition.start()
        }
      }, 1000)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {!isInCall ? (
        /* Call Start Screen */
        <>
          <Card className="glass">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <Bot className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">SachAI Voice Assistant</h3>
                <p className="text-muted-foreground mb-6">
                  Conversational AI powered by advanced language models
                </p>
                
                <div className="flex justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8"
                    onClick={handleStartCall}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Topics */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Battery Availability', icon: '🔋', topic: 'battery' },
                  { label: 'Leave Application', icon: '📅', topic: 'leave' },
                  { label: 'Penalty Query', icon: '💰', topic: 'penalty' },
                  { label: 'Swap Pricing', icon: '💳', topic: 'swap' },
                  { label: 'Nearest Station', icon: '📍', topic: 'station' },
                  { label: 'General Help', icon: '❓', topic: 'default' }
                ].map((item, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2 glass hover:bg-primary/10"
                    onClick={() => {
                      handleStartCall()
                      setTimeout(() => {
                        const userTexts: Record<string, string> = {
                          battery: 'Mujhe battery chahiye',
                          leave: 'Mujhe chhutti chahiye',
                          penalty: 'Mera penalty kitna hai',
                          swap: 'Swap price kya hai',
                          station: 'Nazdiki station kahan hai',
                          default: 'Hello'
                        }
                        const userText = userTexts[item.topic] || 'Hello'
                        setConversation(prev => [...prev, { type: 'user', text: userText }])
                        
                        // Send to backend
                        fetch(`${BACKEND_URL}/text-chat`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ query: userText, driver_id: userId, session_id: userId })
                        })
                        .then(res => res.json())
                        .then(data => {
                          if (!data.error) {
                            setConversation(prev => [...prev, { type: 'ai', text: data.text_response }])
                          }
                        })
                        .catch(console.error)
                      }, 2000)
                    }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Bilingual Support', desc: 'Hindi & English' },
              { title: '24/7 Available', desc: 'Always here to help' },
              { title: 'Smart Responses', desc: 'Powered by AI/LLM' }
            ].map((feature, index) => (
              <Card key={index} className="glass">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        /* Active Call Interface */
        <Card className="glass overflow-hidden">
          {/* Call Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">SachAI</h3>
                  <p className="text-sm text-muted-foreground">Conversational AI Assistant</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Active
                </Badge>
                <p className="text-lg font-mono mt-2">{formatDuration(callDuration)}</p>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="h-80 overflow-auto p-4 space-y-4 bg-secondary/20">
            {conversation.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Conversation will appear here...</p>
              </div>
            )}
            
            {conversation.map((msg, index) => (
              <div 
                key={index}
                className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.type === 'ai' ? 'bg-primary/20' : 'bg-secondary'
                }`}>
                  {msg.type === 'ai' ? (
                    <Bot className="w-5 h-5 text-primary" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.type === 'ai' 
                    ? 'bg-secondary/50' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isAiSpeaking && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-secondary/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Response Buttons */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Tap to speak:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Battery chahiye', topic: 'battery' },
                { label: 'Chhutti leni hai', topic: 'leave' },
                { label: 'Penalty kitna hai', topic: 'penalty' },
                { label: 'Price kya hai', topic: 'swap' },
                { label: 'Station kahan hai', topic: 'station' }
              ].map((item, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const userText = item.label
                    setConversation(prev => [...prev, { type: 'user', text: userText }])
                    
                    // Send to backend
                    fetch(`${BACKEND_URL}/text-chat`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ query: userText, driver_id: userId, session_id: userId })
                    })
                    .then(res => res.json())
                    .then(data => {
                      if (!data.error) {
                        setConversation(prev => [...prev, { type: 'ai', text: data.text_response }])
                      }
                    })
                    .catch(console.error)
                  }}
                  disabled={isAiSpeaking}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Call Controls */}
          <div className="p-6 bg-card border-t border-border">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className={`w-16 h-16 rounded-full ${isListening ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-gray-500/20 text-gray-500'}`}
                disabled
              >
                <Mic className="w-8 h-8" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className={`w-14 h-14 rounded-full ${isSpeakerOff ? 'bg-destructive/20 text-destructive' : ''}`}
                onClick={() => setIsSpeakerOff(!isSpeakerOff)}
              >
                {isSpeakerOff ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground mt-4">
              Driver ID: {userId} | {isListening ? 'Listening... Speak naturally' : 'Voice inactive'}
            </p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="glass border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Powered by Advanced AI</p>
              <p className="text-sm text-muted-foreground">
                SachAI uses conversational AI to understand your queries in Hindi and English. 
                Just speak naturally - no need to press buttons during the call.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  )
}
