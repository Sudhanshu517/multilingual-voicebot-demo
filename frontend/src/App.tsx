import { useState, useEffect } from 'react'
import './App.css'
import { AuthPage } from './sections/AuthPage'
import { Dashboard } from './sections/Dashboard'

export type User = {
  id: string
  name: string
  vehicleModel: string
  batteryLevel: number
  leavesUsed: number
  leavesRemaining: number
  penaltyAmount: number
  subscriptionDue: boolean
}

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('sachAIUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('sachAIUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('sachAIUser')
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('sachAIUser', JSON.stringify(updatedUser))
  }

  return (
    <div className="min-h-screen bg-background">
      {user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
