import { useEffect, useState } from 'react'
import { BatteryCharging, MapPin } from 'lucide-react'

export function CarAnimation() {
  const [progress, setProgress] = useState(0)
  const [showArrival, setShowArrival] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setShowArrival(true)
          return 100
        }
        return prev + 2
      })
    }, 80)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-64 overflow-hidden">
      {/* Sky/Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* City silhouette */}
      <div className="absolute bottom-20 left-0 right-0">
        <svg viewBox="0 0 800 100" className="w-full h-16 opacity-30" preserveAspectRatio="none">
          <path
            d="M0,100 L0,60 L30,60 L30,40 L60,40 L60,70 L90,70 L90,30 L120,30 L120,50 L150,50 L150,80 L180,80 L180,45 L210,45 L210,65 L240,65 L240,35 L270,35 L270,55 L300,55 L300,75 L330,75 L330,50 L360,50 L360,70 L390,70 L390,40 L420,40 L420,60 L450,60 L450,80 L480,80 L480,45 L510,45 L510,65 L540,65 L540,30 L570,30 L570,55 L600,55 L600,75 L630,75 L630,50 L660,50 L660,70 L690,70 L690,40 L720,40 L720,60 L750,60 L750,85 L780,85 L780,55 L800,55 L800,100 Z"
            fill="#1e293b"
          />
        </svg>
      </div>

      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-20 road">
        {/* Moving road lines */}
        <div 
          className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.4) 30px, rgba(255,255,255,0.4) 60px)',
            animation: 'road-move 0.3s linear infinite'
          }}
        />
      </div>

      {/* Charging Station - Destination */}
      <div 
        className="absolute bottom-16 right-8 transition-all duration-500"
        style={{
          transform: showArrival ? 'scale(1.1)' : 'scale(1)',
          filter: showArrival ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8))' : 'none'
        }}
      >
        {/* Station glow */}
        <div className={`absolute -inset-4 rounded-full bg-primary/20 transition-opacity duration-500 ${showArrival ? 'opacity-100' : 'opacity-50'}`} />
        
        {/* Station structure */}
        <div className="relative">
          {/* Roof */}
          <div className="w-24 h-4 bg-gradient-to-r from-primary/80 to-primary rounded-t-lg mx-auto" />
          
          {/* Pillars */}
          <div className="flex justify-between px-2">
            <div className="w-2 h-12 bg-gradient-to-b from-slate-400 to-slate-600" />
            <div className="w-2 h-12 bg-gradient-to-b from-slate-400 to-slate-600" />
          </div>
          
          {/* Base/Canopy */}
          <div className="w-28 h-8 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
            <BatteryCharging className={`w-5 h-5 ${showArrival ? 'text-primary animate-pulse' : 'text-primary/60'}`} />
          </div>
          
          {/* Charging ports */}
          <div className="flex justify-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-primary/40 border-2 border-primary" />
            <div className="w-4 h-4 rounded-full bg-primary/40 border-2 border-primary" />
          </div>
          
          {/* Label */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="flex items-center gap-1 text-primary text-sm font-semibold">
              <MapPin className="w-3 h-3" />
              Battery Smart
            </div>
          </div>
        </div>
      </div>

      {/* EV Car */}
      <div 
        className="absolute bottom-12 transition-all duration-100"
        style={{
          left: `${progress}%`,
          transform: `translateX(-50%) ${showArrival ? 'scale(0.9)' : 'scale(1)'}`,
        }}
      >
        {/* Car glow */}
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
        
        {/* Car body */}
        <div className="relative">
          {/* Car SVG */}
          <svg 
            width="100" 
            height="50" 
            viewBox="0 0 100 50" 
            className="ev-car"
            style={{
              filter: 'drop-shadow(0 4px 15px rgba(34, 197, 94, 0.4))'
            }}
          >
            {/* Car body - sleek EV design */}
            <defs>
              <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="window" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            
            {/* Main body */}
            <path
              d="M5,35 Q5,25 15,22 L35,18 L55,15 L75,18 L90,22 Q95,25 95,32 L95,38 Q95,42 90,42 L85,42 Q85,35 77,35 Q69,35 69,42 L31,42 Q31,35 23,35 Q15,35 15,42 L10,42 Q5,42 5,38 Z"
              fill="url(#carBody)"
            />
            
            {/* Windows */}
            <path
              d="M38,19 L52,16 L72,19 L68,28 L38,28 Z"
              fill="url(#window)"
            />
            
            {/* Headlight */}
            <ellipse cx="92" cy="28" rx="3" ry="4" fill="#fef08a" className="animate-pulse" />
            
            {/* Taillight */}
            <ellipse cx="8" cy="28" rx="2" ry="3" fill="#ef4444" />
            
            {/* Wheels */}
            <circle cx="23" cy="42" r="7" fill="#1f2937" />
            <circle cx="23" cy="42" r="4" fill="#4b5563" />
            <circle cx="77" cy="42" r="7" fill="#1f2937" />
            <circle cx="77" cy="42" r="4" fill="#4b5563" />
            
            {/* Battery indicator on car */}
            <rect x="40" y="30" width="20" height="6" rx="2" fill="#1f2937" />
            <rect x="42" y="32" width="12" height="2" rx="1" fill="#22c55e" className="animate-pulse" />
          </svg>
          
          {/* Charging cable (appears when arrived) */}
          {showArrival && (
            <svg 
              className="absolute top-0 right-0 w-20 h-20 -translate-y-1/2 translate-x-1/2"
              style={{ animation: 'charging-pulse 1s ease-in-out infinite' }}
            >
              <path
                d="M80,40 Q60,40 50,60"
                stroke="#22c55e"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 right-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Starting Point</span>
          <span className={showArrival ? 'text-primary font-semibold' : ''}>
            {showArrival ? 'Arrived!' : `${Math.round(progress)}%`}
          </span>
          <span>Battery Smart</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Arrival message */}
      {showArrival && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-slide-in">
          <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <BatteryCharging className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Arrived at Battery Smart!</h3>
            <p className="text-muted-foreground">Your EV is ready to charge</p>
          </div>
        </div>
      )}
    </div>
  )
}
