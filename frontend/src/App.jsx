import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import ProfileSetup from './pages/ProfileSetup'
import Matches from './pages/Matches'
import Friends from './pages/Friends'
import Chat from './pages/Chat'
// VideoCall is disabled for now
// import VideoCall from './pages/VideoCall'
import Sessions from './pages/Sessions'
import Groups from './pages/Groups'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import GoogleCallback from './pages/GoogleCallback'
import Leaderboard from './pages/Leaderboard'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-soft text-primary-500">
          <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return null
  }
  
  if (user) {
    // Redirect admin users to admin panel, regular users to dashboard
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }
  
  return children
}

// Route guard for admin-only pages
function AdminRoute({ children }) {
  const { user } = useAuth()
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Route guard for regular user pages (non-admin)
function UserRoute({ children }) {
  const { user } = useAuth()
  
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }
  
  return children
}

// Smart redirect based on user role
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      {/* Legal pages - publicly accessible */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      {/* Google OAuth callback - no auth required */}
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HomeRedirect />} />
        {/* User-only routes (study features) */}
        <Route path="dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
        <Route path="profile" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="profile/:userId" element={<UserProfile />} />
        <Route path="matches" element={<UserRoute><Matches /></UserRoute>} />
        <Route path="friends" element={<UserRoute><Friends /></UserRoute>} />
        <Route path="groups" element={<UserRoute><Groups /></UserRoute>} />
        {/* Chat accessible by both users and admins */}
        <Route path="chat" element={<Chat />} />
        <Route path="chat/:conversationId" element={<Chat />} />
        <Route path="video/:roomId" element={<Navigate to="/chat" replace />} />
        <Route path="sessions" element={<UserRoute><Sessions /></UserRoute>} />
        <Route path="activity" element={<UserRoute><Activity /></UserRoute>} />
        <Route path="leaderboard" element={<UserRoute><Leaderboard /></UserRoute>} />
        <Route path="settings" element={<UserRoute><Settings /></UserRoute>} />
        {/* Admin-only route */}
        <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

