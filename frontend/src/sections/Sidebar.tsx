import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BatteryCharging, 
  History, 
  HeadphonesIcon,
  LogOut,
  MessageSquare,
  Video,
  Calendar,
  Settings,
  AlertCircle,
  User as UserIcon,
  MapPin
} from 'lucide-react'
import type { User } from '../App'

interface SidebarProps {
  user: User
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Chatbot', icon: MessageSquare },
    { id: 'webcall', label: 'Web Call', icon: Video },
    { id: 'nearest', label: 'Nearest Stations', icon: MapPin },
    { id: 'leave', label: 'Leave Application', icon: Calendar, badge: user.leavesRemaining },
  ]

  const secondaryItems = [
    { id: 'history', label: 'Conversation History', icon: History },
    { id: 'support', label: 'Human Agent', icon: HeadphonesIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BatteryCharging className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text">SachAI</span>
            <p className="text-xs text-muted-foreground">Battery Smart</p>
          </div>
        </div>
      </div>

      {/* Driver Info */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
        
        {/* Leaves & Penalty Info */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">Leaves Left</p>
            <p className={`text-lg font-bold ${user.leavesRemaining === 0 ? 'text-destructive' : 'text-primary'}`}>
              {user.leavesRemaining}/4
            </p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">Penalty</p>
            <p className={`text-lg font-bold ${user.penaltyAmount > 0 ? 'text-destructive' : ''}`}>
              ₹{user.penaltyAmount}
            </p>
          </div>
        </div>
        
        {user.penaltyAmount > 0 && (
          <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-xs text-destructive">Penalty due: ₹{user.penaltyAmount}</p>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Main Menu
          </p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id === 'dashboard' ? 'dashboard' : item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                (item.id === 'dashboard' && activeTab === 'dashboard') || activeTab === item.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.badge !== undefined && (
                <Badge 
                  variant={item.badge === 0 ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Support
          </p>
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Driver Support Card */}
      <div className="p-4">
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Driver Support</p>
              <p className="text-xs text-muted-foreground">ID: {user.id}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            EXIT SESSION
          </Button>
        </div>
      </div>
    </aside>
  )
}
