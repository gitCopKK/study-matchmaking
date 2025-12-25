import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const refreshToken = searchParams.get('refreshToken')

      if (token && refreshToken) {
        // Store tokens
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)

        try {
          // Fetch user data
          const response = await api.get('/api/users/me')
          const user = response.data

          // Refresh auth context
          await refreshUser()

          // Redirect based on profile completion
          if (!user.profileComplete) {
            navigate('/profile-setup', { replace: true })
          } else if (user.role === 'ADMIN') {
            navigate('/admin', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        } catch (err) {
          console.error('Failed to fetch user after OAuth:', err)
          setError('Failed to complete login. Please try again.')
        }
      } else {
        setError('Authentication failed. No tokens received.')
      }
    }

    handleCallback()
  }, [searchParams, navigate, refreshUser])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="card p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Login Failed</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <a href="/login" className="btn-primary">
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh">
      <div className="card p-8 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
        <p className="text-slate-500">Please wait while we complete your login with Google.</p>
      </div>
    </div>
  )
}

