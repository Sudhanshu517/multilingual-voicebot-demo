import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { CarAnimation } from './CarAnimation'
import { ChargingStation } from './ChargingStation'
import { BatteryStatus } from './BatteryStatus'
import { Chatbot } from './Chatbot'
import { LeaveApplication } from './LeaveApplication'
import { SupportPage } from './SupportPage'
import { WebCall } from './WebCall'
import { SettingsPage } from './SettingsPage'
import { NearestStations } from './NearestStations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Battery, 
  Clock, 
  Zap,
  Car,
  IndianRupee,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react'
import type { User } from '../App'

interface DashboardProps {
  user: User
  onLogout: () => void
  onUpdateUser: (user: User) => void
}

export function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCarAnimation, setShowCarAnimation] = useState(false)
  const [isCharging, setIsCharging] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState(user.batteryLevel)

  const handleNavigateToStation = () => {
    setShowCarAnimation(true)
    setTimeout(() => {
      setShowCarAnimation(false)
      setIsCharging(true)
    }, 4500)
  }

  const handleStartCharging = () => {
    setIsCharging(true)
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCharging(false)
          return 100
        }
        return prev + 1
      })
    }, 200)
  }
  
  // Reference to avoid unused variable warning
  void handleStartCharging

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'charging' && 'Charging Stations'}
                {activeTab === 'battery' && 'Battery Status'}
                {activeTab === 'history' && 'Trip History'}
                {activeTab === 'support' && 'Driver Support'}
                {activeTab === 'leave' && 'Leave Application'}
                {activeTab === 'webcall' && 'Web Call'}
                {activeTab === 'settings' && 'Settings'}
                {activeTab === 'nearest' && 'Nearest Stations'}
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Penalty Alert */}
              {user.penaltyAmount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">Penalty: ₹{user.penaltyAmount}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Delhi NCR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <Card className="glass border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Namaste, {user.name}!
                      </h3>
                      <p className="text-muted-foreground">
                        Driver ID: {user.id} | Welcome to SachAI
                      </p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Car className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { 
                    icon: Battery, 
                    label: 'Battery Level', 
                    value: `${batteryLevel}%`,
                    color: batteryLevel < 30 ? 'text-destructive' : 'text-primary'
                  },
                  { 
                    icon: Navigation, 
                    label: 'Range', 
                    value: `${Math.round(batteryLevel * 4.5)} km`,
                    color: 'text-blue-400'
                  },
                  { 
                    icon: CalendarIcon, 
                    label: 'Leaves Left', 
                    value: `${user.leavesRemaining}/4`,
                    color: user.leavesRemaining === 0 ? 'text-destructive' : 'text-green-400'
                  },
                  { 
                    icon: IndianRupee, 
                    label: 'Penalty Due', 
                    value: `₹${user.penaltyAmount}`,
                    color: user.penaltyAmount > 0 ? 'text-destructive' : 'text-green-400'
                  }
                ].map((stat, index) => (
                  <Card key={index} className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Car Animation Section */}
                <Card className="glass overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-primary" />
                      Navigate to Battery Smart Station
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {showCarAnimation ? (
                      <CarAnimation />
                    ) : (
                      <div className="p-6 space-y-4">
                        <div className="charging-station rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Zap className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">Battery Smart - Sector 62</h4>
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  Open
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                3.2km away • 5 batteries available
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  Base: ₹170 | Secondary: ₹70
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleNavigateToStation}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Navigate Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chatbot Section */}
                <Chatbot userName={user.name.split(' ')[0]} userId={user.id} />
              </div>

              {/* Charging Station Details */}
              {isCharging && (
                <ChargingStation 
                  batteryLevel={batteryLevel}
                  isCharging={isCharging}
                  onStopCharging={() => setIsCharging(false)}
                />
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Swap Battery Status', action: 'swap' },
                  { label: 'Invoice Details', action: 'invoice' },
                  { label: 'Leave Application', action: 'leave' },
                  { label: 'Nearest Station', action: 'nearest' }
                ].map((item, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="glass hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => {
                      if (item.action === 'leave') {
                        setActiveTab('leave')
                      } else if (item.action === 'nearest') {
                        setActiveTab('nearest')
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nearest' && (
            <NearestStations />
          )}

          {activeTab === 'leave' && (
            <LeaveApplication user={user} onUpdateUser={onUpdateUser} />
          )}

          {activeTab === 'webcall' && (
            <WebCall userName={user.name} userId={user.id} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage user={user} onLogout={onLogout} />
          )}

          {activeTab === 'battery' && (
            <BatteryStatus 
              batteryLevel={batteryLevel}
              vehicleModel={user.vehicleModel}
            />
          )}

          {activeTab === 'charging' && (
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Nearby Battery Smart Stations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Battery Smart - Sector 62', distance: '3.2km', available: 5, price: '₹170', status: 'Open' },
                      { name: 'Battery Smart - Saket', distance: '5.8km', available: 3, price: '₹170', status: 'Open' },
                      { name: 'Battery Smart - Connaught Place', distance: '8.1km', available: 0, price: '₹170', status: 'Full' },
                      { name: 'Battery Smart - Gurugram', distance: '12.5km', available: 8, price: '₹170', status: 'Open' }
                    ].map((station, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{station.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {station.distance} • {station.available} batteries • {station.price}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={station.status === 'Open' ? 'default' : 'secondary'}
                          className={station.status === 'Open' ? 'bg-primary' : ''}
                        >
                          {station.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Recent Swap Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: 'Jan 30, 2026', station: 'Battery Smart - Sector 62', amount: '₹170', type: 'Base Swap' },
                      { date: 'Jan 29, 2026', station: 'Battery Smart - Saket', amount: '₹70', type: 'Secondary Swap' },
                      { date: 'Jan 28, 2026', station: 'Battery Smart - Sector 62', amount: '₹170', type: 'Base Swap' }
                    ].map((session, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{session.station}</h4>
                            <p className="text-sm text-muted-foreground">{session.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{session.amount}</p>
                          <p className="text-sm text-muted-foreground">{session.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'support' && (
            <SupportPage userId={user.id} />
          )}
        </div>
      </main>
    </div>
  )
}
