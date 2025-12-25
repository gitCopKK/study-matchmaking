import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await api.get('/api/users/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password })
    const { token, refreshToken, user: userData } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
    
    return userData
  }

  const register = async (data) => {
    const response = await api.post('/api/auth/register', data)
    const { token, refreshToken, user: userData } = response.data
    
    // Store tokens but DON'T set user yet - let Register component show username modal first
    // The Register component will call setUserAfterRegister after modal is dismissed
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    
    // Return userData AND a function to complete the login (set user state)
    return { ...userData, _completeRegistration: () => setUser(userData) }
  }

  // Function to set user after registration modal is dismissed
  const setUserAfterRegister = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser: fetchUser,
    setUserAfterRegister,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

