import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Calendar as CalendarIcon, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Info,
  IndianRupee
} from 'lucide-react'
import type { User } from '../App'

interface LeaveApplicationProps {
  user: User
  onUpdateUser: (user: User) => void
}

export function LeaveApplication({ user, onUpdateUser }: LeaveApplicationProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [leaveHistory, setLeaveHistory] = useState<{date: string; status: 'approved' | 'penalty'}[]>([
    { date: '2026-01-15', status: 'approved' },
    { date: '2026-01-20', status: 'approved' },
  ])

  const MAX_LEAVES_PER_MONTH = 4
  const PENALTY_AMOUNT = 120

  const handleApplyLeave = () => {
    if (!selectedDate) return

    const newLeavesUsed = user.leavesUsed + 1
    const leavesRemaining = Math.max(0, MAX_LEAVES_PER_MONTH - newLeavesUsed)
    const penaltyAmount = newLeavesUsed > MAX_LEAVES_PER_MONTH 
      ? user.penaltyAmount + PENALTY_AMOUNT 
      : user.penaltyAmount

    const updatedUser: User = {
      ...user,
      leavesUsed: newLeavesUsed,
      leavesRemaining: leavesRemaining,
      penaltyAmount: penaltyAmount
    }

    // Add to history
    const status = newLeavesUsed > MAX_LEAVES_PER_MONTH ? 'penalty' : 'approved'
    setLeaveHistory(prev => [...prev, { 
      date: selectedDate.toISOString().split('T')[0], 
      status 
    }])

    onUpdateUser(updatedUser)
    setShowConfirmDialog(false)
  }

  const willIncurPenalty = user.leavesUsed >= MAX_LEAVES_PER_MONTH

  // Generate leave boxes
  const leaveBoxes = Array.from({ length: MAX_LEAVES_PER_MONTH }, (_, i) => {
    const isUsed = i < user.leavesUsed
    return { id: i + 1, isUsed }
  })

  return (
    <div className="space-y-6">
      {/* Leave Summary Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Monthly Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Leave Boxes */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              You have <span className="font-semibold text-primary">{MAX_LEAVES_PER_MONTH}</span> leave days per month
            </p>
            <div className="flex gap-3">
              {leaveBoxes.map((box) => (
                <div
                  key={box.id}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                    box.isUsed
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-secondary/50 border-2 border-dashed border-muted-foreground/30'
                  }`}
                >
                  {box.isUsed ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground">{box.id}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
              <p className="text-sm text-muted-foreground">Leaves Used</p>
              <p className="text-2xl font-bold">{user.leavesUsed}/{MAX_LEAVES_PER_MONTH}</p>
            </div>
            <div className={`p-4 rounded-xl border ${
              user.leavesRemaining === 0 
                ? 'bg-destructive/10 border-destructive/30' 
                : 'bg-secondary/50 border-border'
            }`}>
              <p className="text-sm text-muted-foreground">Leaves Remaining</p>
              <p className={`text-2xl font-bold ${
                user.leavesRemaining === 0 ? 'text-destructive' : 'text-primary'
              }`}>
                {user.leavesRemaining}
              </p>
            </div>
          </div>

          {/* Penalty Alert */}
          {user.penaltyAmount > 0 && (
            <Alert className="mt-4 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">Penalty Applied</AlertTitle>
              <AlertDescription className="text-destructive/80">
                You have exceeded your monthly leave limit. 
                Penalty of <span className="font-bold">₹{PENALTY_AMOUNT}</span> per extra leave applies.
                Total penalty: <span className="font-bold">₹{user.penaltyAmount}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning for next leave */}
          {user.leavesRemaining === 0 && (
            <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
              <Info className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-500">No Leaves Remaining</AlertTitle>
              <AlertDescription className="text-yellow-500/80">
                Applying for another leave will incur a penalty of ₹{PENALTY_AMOUNT}.
                This amount will be recovered at ₹60 per swap transaction.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Apply for Leave */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-border"
                disabled={(date) => date < new Date()}
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-2">Selected Date</p>
                <p className="text-lg font-semibold">
                  {selectedDate ? selectedDate.toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'No date selected'}
                </p>
              </div>

              {willIncurPenalty && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-4 h-4 text-destructive" />
                    <p className="font-semibold text-destructive">Penalty Alert</p>
                  </div>
                  <p className="text-sm text-destructive/80">
                    This leave will incur a penalty of ₹{PENALTY_AMOUNT}.
                    The amount will be recovered through swap payments at ₹60 per transaction.
                  </p>
                </div>
              )}

              <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    variant={willIncurPenalty ? 'destructive' : 'default'}
                    disabled={!selectedDate}
                  >
                    {willIncurPenalty ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Apply Leave (₹{PENALTY_AMOUNT} Penalty)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Apply for Leave
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Leave Application</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to apply for leave on{' '}
                      <span className="font-semibold">
                        {selectedDate?.toLocaleDateString('en-IN')}
                      </span>?
                      {willIncurPenalty && (
                        <span className="block mt-2 text-destructive">
                          This will incur a penalty of ₹{PENALTY_AMOUNT}.
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant={willIncurPenalty ? 'destructive' : 'default'}
                      onClick={handleApplyLeave}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaveHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No leave history</p>
            ) : (
              leaveHistory.map((leave, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      leave.status === 'approved' ? 'bg-primary/20' : 'bg-destructive/20'
                    }`}>
                      {leave.status === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(leave.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leave.status === 'approved' ? 'Approved - No Penalty' : 'Penalty Applied - ₹120'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={leave.status === 'approved' ? 'default' : 'destructive'}
                  >
                    {leave.status === 'approved' ? 'Approved' : 'Penalty'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Information */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            Pricing Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Swap Price</span>
              <span className="font-medium">₹170</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Secondary Swap Price</span>
              <span className="font-medium">₹70</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leave Penalty (per extra leave)</span>
              <span className="font-medium text-destructive">₹120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Charge</span>
              <span className="font-medium">₹40 per swap</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Penalty recovery: ₹60 per swap transaction until full amount collected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
