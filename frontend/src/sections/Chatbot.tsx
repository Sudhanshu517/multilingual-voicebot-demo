import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  ChevronRight,
  Phone,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react'

interface ChatbotProps {
  userName: string
  userId: string
}

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  actions?: { label: string; action: string }[]
}

// Problem categories for SachAI
const problemCategories = [
  {
    category: '🔋 Swap & Battery Related',
    issues: [
      'Swap Information',
      'Battery Availability',
      'DSK Battery Unavailable',
      'Less Range - Within 2 Hours',
      'Less Range - After 2 Hours',
      'Battery Pick-Up Request'
    ]
  },
  {
    category: '💰 Penalty, Leave & Subscription',
    issues: [
      'Penalty Information',
      'Leave / Penalty Removal',
      'Monthly Subscription',
      'Payment Over Due',
      'VIP Pass Info'
    ]
  },
  {
    category: '🧭 Navigation & Station Issues',
    issues: [
      'Navigation Details',
      'Station Closed'
    ]
  },
  {
    category: '🧰 Vehicle / Hardware Issues',
    issues: [
      'Meter Broken',
      'Wire Issue',
      'Connector Problem'
    ]
  },
  {
    category: '🚨 Theft, Fraud & Legal',
    issues: [
      'Meter Stolen',
      'Battery Stolen',
      'Vehicle Impounded'
    ]
  }
]

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
export function Chatbot({ userName, userId }: ChatbotProps) {
  const welcomeMessage = `Namaste ${userName}! Main SachAI hoon. Aapki help kaise kar sakta hoon today?\n\n(Hello ${userName}! I am SachAI. How can I help you today?)\n\nYour Driver ID: ${userId}`
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      actions: [
        { label: 'Find Charging Station', action: 'find_station' },
        { label: 'Check Battery Status', action: 'battery_status' },
        { label: 'Leave Application', action: 'leave_info' },
        { label: 'Penalty Information', action: 'penalty_info' }
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch(`${BACKEND_URL}/text-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          driver_id: userId,
          session_id: userId
        })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const botResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.text_response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
      
      // Play audio response
      if (data.audio_response) {
        playAudioFromHex(data.audio_response)
      }
      
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const playAudioFromHex = (hexString: string) => {
    try {
      const bytes = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await sendVoiceMessage(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsTyping(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.wav')
      formData.append('driver_id', userId)
      formData.append('session_id', userId)

      const response = await fetch(`${BACKEND_URL}/voice-chat`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Add user message (transcribed text)
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: data.text_input,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Add bot response
      const botResponse: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.text_response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      
      // Play audio response
      if (data.audio_response) {
        playAudioFromHex(data.audio_response)
      }
      
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I could not process your voice message. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleAction = (action: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: getActionLabel(action),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = generateActionResponse(action)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      find_station: 'Find nearest charging station',
      battery_status: 'Check my battery status',
      leave_info: 'Leave application information',
      penalty_info: 'Penalty information',
      navigate: 'Navigate to station',
      book_slot: 'Book a charging slot',
      call_support: 'Call human agent'
    }
    return labels[action] || action
  }

  const generateBotResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('charge') || lowerInput.includes('station') || lowerInput.includes('swap')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `📍 Nearest Battery Smart Station:\n\nSector 62, Noida\n• Distance: 3.2km\n• Available Batteries: 5\n• Status: Open 24/7\n• Base Swap Price: ₹170\n• Secondary Swap: ₹70\n\nWould you like to navigate or book a slot?`,
        timestamp: new Date(),
        actions: [
          { label: 'Navigate Now', action: 'navigate' },
          { label: 'Book Slot', action: 'book_slot' }
        ]
      }
    }
    
    if (lowerInput.includes('battery') || lowerInput.includes('range')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `🔋 Your Battery Status:\n\n• Current Level: 65%\n• Estimated Range: 85 km\n• Battery Health: Good\n• Temperature: 28°C\n\nYour battery is performing well!`,
        timestamp: new Date()
      }
    }

    if (lowerInput.includes('leave') || lowerInput.includes('chhutti')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `📅 Leave Information:\n\n• Monthly Leave Allowance: 4 days\n• Leaves Used This Month: 0\n• Leaves Remaining: 4\n• Penalty for Extra Leave: ₹120\n\nPenalty Recovery: ₹60 per swap transaction\n\nApply for leave through the Leave Application section.`,
        timestamp: new Date(),
        actions: [
          { label: 'Go to Leave Application', action: 'leave_app' }
        ]
      }
    }

    if (lowerInput.includes('penalty') || lowerInput.includes('charge') || lowerInput.includes('fine')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `💰 Penalty & Pricing Information:\n\nSwap Pricing:\n• Base Swap: ₹170\n• Secondary Swap: ₹70\n\nLeave Penalty:\n• Extra Leave (beyond 4/month): ₹120\n• Recovery: ₹60 per swap transaction\n\nService Charge: ₹40 per swap\n\nFor penalty disputes, call our support.`,
        timestamp: new Date(),
        actions: [
          { label: 'Call Support', action: 'call_support' }
        ]
      }
    }

    if (lowerInput.includes('payment') || lowerInput.includes('subscription')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `💳 Payment Information:\n\n• Monthly Subscription: As per your plan\n• Service Charge: ₹40 per swap\n• Penalty (if any): Recovered at ₹60 per swap\n\nYour account is in good standing. No overdue payments.`,
        timestamp: new Date()
      }
    }

    // Default response with problem categories
    let categoriesText = '📋 I can help you with:\n\n'
    problemCategories.forEach(cat => {
      categoriesText += `${cat.category}\n`
    })
    categoriesText += '\nOr type your specific issue for assistance.'

    return {
      id: Date.now().toString(),
      type: 'bot',
      content: categoriesText,
      timestamp: new Date()
    }
  }

  const generateActionResponse = (action: string): Message => {
    const responses: Record<string, Message> = {
      find_station: {
        id: Date.now().toString(),
        type: 'bot',
        content: `📍 Nearest Battery Smart Station:\n\nSector 62, Noida\n• Distance: 3.2km\n• Available Batteries: 5\n• Open 24/7\n• Base Swap: ₹170`,
        timestamp: new Date(),
        actions: [
          { label: 'Navigate Now', action: 'navigate' },
          { label: 'Call Station', action: 'call_support' }
        ]
      },
      battery_status: {
        id: Date.now().toString(),
        type: 'bot',
        content: '🔋 Your battery is at 65% with 85km range. Health status: Good.',
        timestamp: new Date()
      },
      leave_info: {
        id: Date.now().toString(),
        type: 'bot',
        content: `📅 Leave Information:\n\n• 4 leaves per month allowed\n• Extra leave penalty: ₹120\n• Recovery: ₹60 per swap\n\nGo to Leave Application to apply.`,
        timestamp: new Date(),
        actions: [
          { label: 'Apply Leave', action: 'leave_app' }
        ]
      },
      penalty_info: {
        id: Date.now().toString(),
        type: 'bot',
        content: `💰 Penalty Structure:\n\n• Extra Leave: ₹120\n• Recovered at: ₹60 per swap\n\nFor disputes, call 080553 00400`,
        timestamp: new Date(),
        actions: [
          { label: 'Call Support', action: 'call_support' }
        ]
      },
      navigate: {
        id: Date.now().toString(),
        type: 'bot',
        content: '🚗 Starting navigation to Battery Smart - Sector 62...\n\nEstimated arrival: 8 minutes',
        timestamp: new Date()
      },
      book_slot: {
        id: Date.now().toString(),
        type: 'bot',
        content: '✅ Slot booked! Reserved for 30 minutes.',
        timestamp: new Date()
      },
      call_support: {
        id: Date.now().toString(),
        type: 'bot',
        content: '📞 Connecting you to SachAI Support...\n\nCall: 080553 00400\n\nAvailable 24/7',
        timestamp: new Date(),
        actions: [
          { label: 'Call Now', action: 'dial_number' }
        ]
      },
      dial_number: {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Calling 080553 00400...',
        timestamp: new Date()
      }
    }

    return responses[action] || {
      id: Date.now().toString(),
      type: 'bot',
      content: 'I will connect you to a human agent. Call 080553 00400 for immediate assistance.',
      timestamp: new Date(),
      actions: [
        { label: 'Call Support', action: 'dial_number' }
      ]
    }
  }

  const handleCallSupport = () => {
    window.location.href = 'tel:08055300400'
  }

  return (
    <Card className="glass flex flex-col h-[500px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            SachAI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 py-2 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'bot' 
                  ? 'bg-primary/20' 
                  : 'bg-secondary'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block rounded-2xl px-4 py-2 text-sm ${
                  message.type === 'bot'
                    ? 'bg-secondary/50 text-left'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                </div>
                
                {/* Action buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-primary/10 border-primary/30 hover:bg-primary/20"
                        onClick={() => {
                          if (action.action === 'dial_number') {
                            handleCallSupport()
                          } else {
                            handleAction(action.action)
                          }
                        }}
                      >
                        {action.label}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message or ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-secondary/50 border-border"
            />
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-secondary hover:bg-secondary/80'}`}
              disabled={isTyping}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleSend}
              className="bg-primary hover:bg-primary/90"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {[
              'Swap Battery',
              'Leave Info',
              'Penalty Query',
              'Call Support'
            ].map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap glass"
                onClick={() => {
                  if (action === 'Call Support') {
                    handleCallSupport()
                  } else {
                    setInputValue(action)
                  }
                }}
              >
                {action === 'Call Support' && <Phone className="w-3 h-3 mr-1" />}
                {action}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </Card>
  )
}
