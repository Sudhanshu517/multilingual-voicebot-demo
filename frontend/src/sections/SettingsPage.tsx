import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Separator component removed
import { 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Smartphone,
  CreditCard,
  MapPin,
  Languages,
  Volume2,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import type { User as UserType } from '../App'

interface SettingsPageProps {
  user: UserType
  onLogout: () => void
}

export function SettingsPage({ user, onLogout }: SettingsPageProps) {
  const [notifications, setNotifications] = useState({
    push: true,
    sms: true,
    email: false,
    marketing: false
  })
  
  const [preferences, setPreferences] = useState({
    darkMode: true,
    language: 'English',
    autoNavigate: true,
    saveHistory: true
  })

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
                onClick={() => setShowEditProfile(!showEditProfile)}
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">Driver ID: {user.id}</p>
                </div>
                <Badge className="bg-primary">Active</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{user.vehicleModel}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">+91 98XXX XXXXX</p>
                </div>
              </div>
            </div>
          </div>

          {showEditProfile && (
            <div className="mt-6 p-4 rounded-xl bg-secondary/30 space-y-4">
              <h4 className="font-medium">Edit Profile</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={user.name} className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+91 98XXX XXXXX" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="driver@email.com" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input placeholder="+91 98XXX XXXXX" className="bg-secondary/50" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-primary">Save Changes</Button>
                <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: 'push', label: 'Push Notifications', desc: 'Get alerts about swaps, penalties, and updates', icon: Smartphone },
            { id: 'sms', label: 'SMS Alerts', desc: 'Receive important updates via SMS', icon: MessageSquare },
            { id: 'email', label: 'Email Notifications', desc: 'Monthly reports and statements', icon: MailIcon },
            { id: 'marketing', label: 'Marketing & Offers', desc: 'Promotional messages and discounts', icon: Volume2 }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch 
                checked={notifications[item.id as keyof typeof notifications]}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [item.id]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Moon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
              </div>
            </div>
            <Switch 
              checked={preferences.darkMode}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, darkMode: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Languages className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {preferences.language}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Auto Navigation</p>
                <p className="text-sm text-muted-foreground">Automatically start navigation to stations</p>
              </div>
            </div>
            <Switch 
              checked={preferences.autoNavigate}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, autoNavigate: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter current password"
                    className="bg-secondary/50 pr-10"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" placeholder="Enter new password" className="bg-secondary/50" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
            </div>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Enabled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  UPI
                </div>
                <div>
                  <p className="font-medium">UPI - Google Pay</p>
                  <p className="text-sm text-muted-foreground">driver@okaxis</p>
                </div>
              </div>
              <Badge className="bg-primary">Default</Badge>
            </div>
            
            <Button variant="outline" className="w-full glass">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="glass border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Download Account Data
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>SachAI Driver Portal v2.0</p>
        <p>Battery Smart Technologies Pvt. Ltd.</p>
        <p className="mt-1">Support: 080553 00400</p>
      </div>
    </div>
  )
}

// Mail icon component
function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
