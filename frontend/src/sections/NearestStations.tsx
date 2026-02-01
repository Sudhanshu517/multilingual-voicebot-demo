import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Navigation, 
  BatteryCharging, 
  Clock, 
  Zap,
  Search,
  Phone,
  Car,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react'

// Battery Smart Station Data (Simulated API)
interface Station {
  id: string
  name: string
  address: string
  distance: number
  lat: number
  lng: number
  batteriesAvailable: number
  totalBatteries: number
  status: 'open' | 'closed' | 'maintenance'
  openTime: string
  closeTime: string
  basePrice: number
  secondaryPrice: number
  phone: string
  lastUpdated: string
}

// Simulated real-time station data
const STATIONS: Station[] = [
  {
    id: 'BS001',
    name: 'Battery Smart - Sector 62',
    address: 'Block C, Sector 62, Noida, Uttar Pradesh',
    distance: 2.3,
    lat: 28.6139,
    lng: 77.3660,
    batteriesAvailable: 12,
    totalBatteries: 20,
    status: 'open',
    openTime: '06:00',
    closeTime: '23:00',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '2 min ago'
  },
  {
    id: 'BS002',
    name: 'Battery Smart - Saket',
    address: 'Saket District Centre, New Delhi',
    distance: 5.8,
    lat: 28.5245,
    lng: 77.2065,
    batteriesAvailable: 5,
    totalBatteries: 15,
    status: 'open',
    openTime: '06:00',
    closeTime: '23:00',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '5 min ago'
  },
  {
    id: 'BS003',
    name: 'Battery Smart - Connaught Place',
    address: 'Block D, Connaught Place, New Delhi',
    distance: 8.2,
    lat: 28.6315,
    lng: 77.2167,
    batteriesAvailable: 0,
    totalBatteries: 18,
    status: 'open',
    openTime: '06:00',
    closeTime: '23:00',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '1 min ago'
  },
  {
    id: 'BS004',
    name: 'Battery Smart - Gurugram',
    address: 'Sector 29, Gurugram, Haryana',
    distance: 12.5,
    lat: 28.4595,
    lng: 77.0266,
    batteriesAvailable: 18,
    totalBatteries: 25,
    status: 'open',
    openTime: '05:30',
    closeTime: '23:30',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '3 min ago'
  },
  {
    id: 'BS005',
    name: 'Battery Smart - Ghaziabad',
    address: 'Indirapuram, Ghaziabad, Uttar Pradesh',
    distance: 15.3,
    lat: 28.6443,
    lng: 77.3542,
    batteriesAvailable: 8,
    totalBatteries: 15,
    status: 'maintenance',
    openTime: '06:00',
    closeTime: '22:00',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '10 min ago'
  },
  {
    id: 'BS006',
    name: 'Battery Smart - Faridabad',
    address: 'Sector 15, Faridabad, Haryana',
    distance: 18.7,
    lat: 28.4089,
    lng: 77.3178,
    batteriesAvailable: 15,
    totalBatteries: 20,
    status: 'open',
    openTime: '06:00',
    closeTime: '23:00',
    basePrice: 170,
    secondaryPrice: 70,
    phone: '08055300400',
    lastUpdated: '4 min ago'
  }
]

interface NearestStationsProps {
  userLocation?: { lat: number; lng: number }
}

export function NearestStations({ userLocation: _userLocation }: NearestStationsProps) {
  // User location can be used for actual geolocation in production
  const [stations, setStations] = useState<Station[]>(STATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Simulate real-time updates
  const refreshData = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      // Randomly update battery counts to simulate real-time
      setStations(prev => prev.map(station => ({
        ...station,
        batteriesAvailable: Math.max(0, station.batteriesAvailable + Math.floor(Math.random() * 5) - 2),
        lastUpdated: 'Just now'
      })))
      setIsRefreshing(false)
    }, 1500)
  }, [])

  // Filter stations based on search
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort by distance
  const sortedStations = [...filteredStations].sort((a, b) => a.distance - b.distance)

  // Check if station is currently open
  const isStationOpen = (station: Station): boolean => {
    if (station.status !== 'open') return false
    const now = currentTime
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const [openHour, openMin] = station.openTime.split(':').map(Number)
    const [closeHour, closeMin] = station.closeTime.split(':').map(Number)
    
    const currentTimeVal = currentHour * 60 + currentMin
    const openTimeVal = openHour * 60 + openMin
    const closeTimeVal = closeHour * 60 + closeMin
    
    return currentTimeVal >= openTimeVal && currentTimeVal <= closeTimeVal
  }

  const getStatusBadge = (station: Station) => {
    const isOpen = isStationOpen(station)
    
    if (station.status === 'maintenance') {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Maintenance</Badge>
    }
    if (station.status === 'closed' || !isOpen) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Closed</Badge>
    }
    if (station.batteriesAvailable === 0) {
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30"><AlertCircle className="w-3 h-3 mr-1" /> No Battery</Badge>
    }
    return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Open</Badge>
  }

  const getBatteryStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage === 0) return { color: 'text-destructive', bg: 'bg-destructive/20', label: 'Out of Stock' }
    if (percentage < 30) return { color: 'text-orange-500', bg: 'bg-orange-500/20', label: 'Low Stock' }
    if (percentage < 60) return { color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Moderate' }
    return { color: 'text-green-500', bg: 'bg-green-500/20', label: 'Well Stocked' }
  }

  const handleNavigate = (station: Station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Nearest Battery Smart Stations
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time availability • {stations.length} stations nearby
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by area or station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card className="glass overflow-hidden">
        <div className="relative h-80 bg-slate-900">
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
            {/* Grid lines to simulate map */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 197, 94, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 197, 94, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            
            {/* User location marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 bg-primary rounded-full border-2 border-white animate-pulse" />
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
              </div>
              <p className="absolute top-8 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded">
                You are here
              </p>
            </div>

            {/* Station markers */}
            {sortedStations.slice(0, 4).map((station, index) => {
              const positions = [
                { top: '20%', left: '30%' },
                { top: '40%', left: '70%' },
                { top: '60%', left: '20%' },
                { top: '70%', left: '60%' }
              ]
              const pos = positions[index] || { top: '50%', left: '50%' }
              const isOpen = isStationOpen(station)
              
              return (
                <div 
                  key={station.id}
                  className="absolute cursor-pointer group"
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white transition-transform group-hover:scale-110 ${
                    station.batteriesAvailable > 0 && isOpen
                      ? 'bg-green-500' 
                      : station.status === 'maintenance'
                      ? 'bg-yellow-500'
                      : 'bg-destructive'
                  }`}>
                    <BatteryCharging className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {station.name} ({station.batteriesAvailable} batteries)
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white font-medium mb-2">Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-white">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-white">Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-xs text-white">Closed/No Battery</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedStations.map((station) => {
          const batteryStatus = getBatteryStatus(station.batteriesAvailable, station.totalBatteries)
          const isOpen = isStationOpen(station)
          
          return (
            <Card 
              key={station.id} 
              className={`glass hover:border-primary/50 transition-all cursor-pointer ${
                selectedStation?.id === station.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedStation(station)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{station.name}</h4>
                    <p className="text-sm text-muted-foreground">{station.address}</p>
                  </div>
                  {getStatusBadge(station)}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary/50 text-center">
                    <Navigation className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="font-semibold">{station.distance} km</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${batteryStatus.bg}`}>
                    <BatteryCharging className={`w-4 h-4 mx-auto mb-1 ${batteryStatus.color}`} />
                    <p className="text-xs text-muted-foreground">Batteries</p>
                    <p className={`font-semibold ${batteryStatus.color}`}>
                      {station.batteriesAvailable}/{station.totalBatteries}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/50 text-center">
                    <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Timing</p>
                    <p className="font-semibold">{station.openTime}-{station.closeTime}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <IndianRupee className="w-3 h-3" />
                      ₹{station.basePrice} base
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated: {station.lastUpdated}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `tel:${station.phone}`
                      }}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      disabled={!isOpen || station.batteriesAvailable === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNavigate(station)
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Station Details */}
      {selectedStation && (
        <Card className="glass border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedStation.name}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedStation(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Operating Hours</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStation.openTime} - {selectedStation.closeTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Contact</p>
                    <p className="text-sm text-muted-foreground">{selectedStation.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Battery Availability</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStation.batteriesAvailable} of {selectedStation.totalBatteries} batteries available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Base Swap: ₹{selectedStation.basePrice} | Secondary: ₹{selectedStation.secondaryPrice}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Distance</p>
                    <p className="text-sm text-muted-foreground">{selectedStation.distance} km from your location</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => handleNavigate(selectedStation)}
                disabled={!isStationOpen(selectedStation) || selectedStation.batteriesAvailable === 0}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = `tel:${selectedStation.phone}`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Station
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="glass border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">SachAI = Google Maps (Where) + Battery Smart API (How many) + LLM (How to explain)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time data updates every few minutes. Battery availability may change as drivers swap batteries.
                Always check current status before navigating to a station.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
