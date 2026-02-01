import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Battery, 
  BatteryCharging, 
  BatteryWarning,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gauge,
  Thermometer,
  Activity
} from 'lucide-react'

interface BatteryStatusProps {
  batteryLevel: number
  vehicleModel: string
}

export function BatteryStatus({ batteryLevel, vehicleModel }: BatteryStatusProps) {
  const getBatteryHealth = () => {
    if (batteryLevel >= 80) return { status: 'Excellent', color: 'text-green-400', icon: Battery }
    if (batteryLevel >= 50) return { status: 'Good', color: 'text-blue-400', icon: Battery }
    if (batteryLevel >= 20) return { status: 'Fair', color: 'text-yellow-400', icon: BatteryWarning }
    return { status: 'Low', color: 'text-red-400', icon: BatteryWarning }
  }

  const batteryHealth = getBatteryHealth()
  const estimatedRange = Math.round(batteryLevel * 4.5)
  const maxRange = 450

  const batteryHistory = [
    { date: 'Jan 30', level: 85, type: 'charge' },
    { date: 'Jan 29', level: 45, type: 'drive' },
    { date: 'Jan 28', level: 90, type: 'charge' },
    { date: 'Jan 27', level: 60, type: 'drive' },
    { date: 'Jan 26', level: 30, type: 'drive' },
    { date: 'Jan 25', level: 100, type: 'charge' }
  ]

  return (
    <div className="space-y-6">
      {/* Main battery card */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-primary" />
              Battery Health - {vehicleModel}
            </CardTitle>
            <Badge variant="outline" className={`${batteryHealth.color} border-current`}>
              <batteryHealth.icon className="w-3 h-3 mr-1" />
              {batteryHealth.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Large battery indicator */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-56 border-4 border-primary/30 rounded-3xl p-2 relative overflow-hidden">
                {/* Battery cap */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-primary/30 rounded-t-lg" />
                
                {/* Battery fill */}
                <div 
                  className="absolute bottom-2 left-2 right-2 rounded-2xl transition-all duration-500"
                  style={{ 
                    height: `${batteryLevel}%`,
                    background: `linear-gradient(to top, 
                      ${batteryLevel < 20 ? '#ef4444' : batteryLevel < 50 ? '#eab308' : '#22c55e'} 0%, 
                      ${batteryLevel < 20 ? '#dc2626' : batteryLevel < 50 ? '#ca8a04' : '#16a34a'} 100%)`
                  }}
                >
                  {/* Animated charging effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse" />
                </div>
                
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white drop-shadow-lg">{batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* Battery details */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Range</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{estimatedRange}</span>
                  <span className="text-muted-foreground">km</span>
                </div>
                <p className="text-xs text-muted-foreground">of {maxRange} km max range</p>
              </div>

              <Progress value={(estimatedRange / maxRange) * 100} className="h-2" />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Battery Capacity</p>
                  <p className="font-semibold">75 kWh</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Degradation</p>
                  <p className="font-semibold text-green-400">2.3%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battery metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Gauge, label: 'Voltage', value: '400.5V', unit: '', trend: 'up' },
          { icon: Activity, label: 'Current', value: '0.0A', unit: '', trend: 'neutral' },
          { icon: Thermometer, label: 'Temperature', value: '28°C', unit: '', trend: 'up' },
          { icon: Calendar, label: 'Last Charged', value: '2 hrs', unit: 'ago', trend: 'neutral' }
        ].map((metric, index) => (
          <Card key={index} className="glass">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <metric.icon className="w-5 h-5 text-primary" />
                {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-semibold">{metric.value} <span className="text-xs text-muted-foreground">{metric.unit}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Battery history */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            7-Day Battery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {batteryHistory.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      day.type === 'charge' ? 'bg-primary' : 'bg-secondary'
                    }`}
                    style={{ height: `${day.level * 0.8}px` }}
                  >
                    {day.type === 'charge' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-primary animate-pulse rounded-t-lg" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-xs text-muted-foreground">Charging</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-secondary" />
              <span className="text-xs text-muted-foreground">Driving</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battery tips */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Battery Care Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Keep charge between 20-80% for daily use',
              'Avoid frequent fast charging',
              'Precondition battery before charging',
              'Park in shade during hot weather'
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-primary">{index + 1}</span>
                </div>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
