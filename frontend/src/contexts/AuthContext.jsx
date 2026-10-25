import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.users.me()
      .then(async (response) => {
        if (response.status === 401) return null
        if (!response.ok) throw new Error('Unable to restore your sign-in session')
        return response.json()
      })
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        console.error('Unable to restore your sign-in session', error)
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
  }, [])

  const logout = useCallback(async () => {
    const response = await api.users.logout()
    if (!response.ok) throw new Error('Could not sign out. Please try again.')
    setUser(null)
    localStorage.removeItem('pg_user')
    localStorage.removeItem('pg_token')
  }, [])

  const value = { user, loading, login, logout, isAuthenticated: !!user }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
