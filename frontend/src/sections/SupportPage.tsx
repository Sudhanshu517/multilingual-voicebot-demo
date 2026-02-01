import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Clock, HeadphonesIcon, ChevronRight, User } from 'lucide-react'

interface SupportPageProps {
  userId: string
}

export function SupportPage({ userId }: SupportPageProps) {
  const handleCallSupport = () => {
    window.location.href = 'tel:08055300400'
  }

  const problemCategories = [
    {
      title: 'Swap & Battery Related',
      icon: '🔋',
      problems: [
        'Swap Information Shared',
        'Battery Availability',
        'DSK Battery Unavailable',
        'First Swap – Less Range within 2 Hours',
        'Second Onwards Swap – Less Range within 2 Hours',
        'Less Range – Complaint within 2 Hours',
        'Less Range – Complaint after 2 Hours',
        'Battery Pick-Up Request'
      ]
    },
    {
      title: 'Penalty, Leave & Subscription',
      icon: '💰',
      problems: [
        'Penalty Information Shared',
        'Driver Pre-Informed Leave / Penalty Removal',
        'Penalty / Leave Rejected',
        'Monthly Subscription Amount Information',
        'Payment Over Due Information',
        'Payment Confirmation',
        'VIP Pass – Non-VIP Driver'
      ]
    },
    {
      title: 'Navigation & Station Issues',
      icon: '🧭',
      problems: [
        'Navigation Details Shared',
        'Station Closed – Within Operational Hours'
      ]
    },
    {
      title: 'Vehicle / Hardware Issues',
      icon: '🧰',
      problems: [
        'Meter Broken',
        'Meter – No Reading (No Light)',
        'Wire Broken',
        'Wiring Issue',
        'Connector Broken',
        'Connector Spark / Wire Melt / Smoke / Burn'
      ]
    },
    {
      title: 'Theft, Fraud & Legal',
      icon: '🚨',
      problems: [
        'Meter Stolen',
        'Stolen Battery and Vehicle',
        'Vehicle Impounded / Seized with Battery',
        'Fake Swap Created by Partner',
        'Face Mismatch – No Waiver'
      ]
    },
    {
      title: 'Communication / Account Issues',
      icon: '📩',
      problems: [
        'SMS Not Received – Calling Number Same as Registered'
      ]
    },
    {
      title: 'Driver Personal / General',
      icon: '🧑‍💼',
      problems: [
        'Driver Leave – Personal Issue',
        'Enquiry – Others'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Connect to Human Agent */}
      <Card className="glass border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center animate-pulse-glow border-2 border-primary/50">
              <HeadphonesIcon className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Connect with Human Agent</h3>
              <p className="text-muted-foreground mb-4">
                Get immediate assistance from our support team. Your Driver ID: <span className="font-mono text-primary">{userId}</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleCallSupport}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 080553 00400
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-500">Available Now</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Support Agent</p>
              <p className="font-semibold">Battery Smart Support</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Support Hours</p>
              <p className="font-semibold">24/7 Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contact</p>
              <p className="font-semibold">080553 00400</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Problem Categories */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Common Support Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemCategories.map((category, index) => (
              <div 
                key={index} 
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                onClick={handleCallSupport}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="font-semibold">{category.title}</h4>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.problems.slice(0, 3).map((problem, pIndex) => (
                    <Badge key={pIndex} variant="secondary" className="text-xs">
                      {problem.length > 25 ? problem.substring(0, 25) + '...' : problem}
                    </Badge>
                  ))}
                  {category.problems.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.problems.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Report Battery Issue',
              'Request Pickup',
              'Penalty Dispute',
              'Update Details',
              'VIP Pass Info',
              'Station Closed',
              'Meter Issue',
              'Other Enquiry'
            ].map((action, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="glass hover:bg-primary/10 justify-start"
                onClick={handleCallSupport}
              >
                <Phone className="w-3 h-3 mr-2" />
                {action}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
