import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BatteryCharging, Zap, Shield, Car } from 'lucide-react'
import type { User } from '../App'

interface AuthPageProps {
  onLogin: (user: User) => void
}

// Indian driver names
const indianNames = [
  'Rajesh Kumar',
  'Amit Sharma',
  'Vikram Singh',
  'Suresh Patel',
  'Ramesh Gupta',
  'Anil Verma',
  'Sunil Yadav',
  'Mahesh Reddy',
  'Prakash Nair',
  'Dinesh Joshi'
]

export function AuthPage({ onLogin }: AuthPageProps) {
  const [driverId, setDriverId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!driverId.trim()) {
      setError('Please enter your 6-digit Driver ID')
      return
    }

    // if (!/^\d{7}$/.test(driverId)) {
    //   setError('Driver ID must be exactly 6 digits')
    //   return
    // }

    setIsLoading(true)
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate random Indian name
    const randomName = indianNames[Math.floor(Math.random() * indianNames.length)]
    
    // Mock user data
    const user: User = {
      id: driverId,
      name: randomName,
      vehicleModel: 'Electric Auto',
      batteryLevel: 65,
      leavesUsed: 0,
      leavesRemaining: 4,
      penaltyAmount: 0,
      subscriptionDue: false
    }
    
    onLogin(user)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo section */}
        <div className="text-center mb-8 animate-slide-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mb-6 animate-pulse-glow">
            <BatteryCharging className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">SachAI</h1>
          <p className="text-muted-foreground">Battery Smart Driver Portal</p>
        </div>

        <Card className="glass animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Driver Login</CardTitle>
            <CardDescription className="text-center">
              Enter your 6-digit Driver ID to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driverId" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Driver ID (6 digits)
                </Label>
                <Input
                  id="driverId"
                  placeholder="Enter 6-digit ID (e.g., 482900)"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value.slice(0, 7))}
                  className="bg-secondary/50 border-border focus:border-primary focus:ring-primary text-center text-lg tracking-widest"
                  disabled={isLoading}
                  maxLength={7}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive text-center">{error}</div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Access Dashboard
                  </div>
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Try any 6-digit Driver ID to demo (e.g., <span className="text-primary">482900</span>)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Car, label: 'Smart Swaps' },
            { icon: Zap, label: 'Fast Charging' },
            { icon: BatteryCharging, label: 'Real-time Status' }
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
