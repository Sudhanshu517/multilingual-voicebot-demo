import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Clock, 
  BatteryCharging, 
  Pause,
  Play,
  Power,
  TrendingUp,
  Droplets,
  Thermometer
} from 'lucide-react'

interface ChargingStationProps {
  batteryLevel: number
  isCharging: boolean
  onStopCharging: () => void
}

export function ChargingStation({ batteryLevel, isCharging, onStopCharging }: ChargingStationProps) {
  const [chargingPower, setChargingPower] = useState(0)
  const [sessionTime, setSessionTime] = useState(0)
  const [energyDelivered, setEnergyDelivered] = useState(0)
  const [cost, setCost] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [temperature, setTemperature] = useState(28)

  useEffect(() => {
    if (!isCharging || isPaused) return

    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
      setChargingPower(prev => {
        const target = 145 + Math.random() * 10
        return prev + (target - prev) * 0.1
      })
      setEnergyDelivered(prev => prev + 0.04)
      setCost(prev => prev + 1.2)
      setTemperature(_prev => 28 + Math.random() * 2)
    }, 1000)

    return () => clearInterval(interval)
  }, [isCharging, isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const estimatedTimeRemaining = Math.max(0, Math.round((100 - batteryLevel) * 0.8))

  return (
    <Card className="glass border-primary/30 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <BatteryCharging className="w-4 h-4 text-primary" />
            </div>
            Battery Smart - Active Charging
          </CardTitle>
          <Badge 
            variant={isCharging && !isPaused ? 'default' : 'secondary'}
            className={isCharging && !isPaused ? 'bg-primary animate-pulse' : ''}
          >
            {isCharging && !isPaused ? 'Charging' : isPaused ? 'Paused' : 'Standby'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main charging visualization */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          {/* Animated charging effect */}
          {isCharging && !isPaused && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
            </div>
          )}
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Battery level */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-secondary"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${batteryLevel * 3.52} 352`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{batteryLevel}%</span>
                  <span className="text-xs text-muted-foreground">Charged</span>
                </div>
              </div>
            </div>

            {/* Charging stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Power</span>
                </div>
                <span className="font-semibold">{chargingPower.toFixed(1)} kW</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Session Time</span>
                </div>
                <span className="font-semibold">{formatTime(sessionTime)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Energy</span>
                </div>
                <span className="font-semibold">{energyDelivered.toFixed(2)} kWh</span>
              </div>
            </div>

            {/* Cost and status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                <p className="text-sm text-muted-foreground mb-1">Current Cost</p>
                <p className="text-2xl font-bold text-primary">₹{cost.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">@ ₹8.50/kWh</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span className="font-medium">~{estimatedTimeRemaining} min</span>
                </div>
                <Progress value={batteryLevel} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Droplets, label: 'Coolant Temp', value: `${temperature.toFixed(1)}°C`, color: 'text-blue-400' },
            { icon: Thermometer, label: 'Battery Temp', value: '32°C', color: 'text-orange-400' },
            { icon: Zap, label: 'Voltage', value: '400V', color: 'text-yellow-400' },
            { icon: TrendingUp, label: 'Efficiency', value: '94%', color: 'text-green-400' }
          ].map((metric, index) => (
            <div key={index} className="p-3 rounded-lg bg-secondary/30 text-center">
              <metric.icon className={`w-5 h-5 ${metric.color} mx-auto mb-2`} />
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isCharging}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onStopCharging}
          >
            <Power className="w-4 h-4 mr-2" />
            Stop Charging
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
