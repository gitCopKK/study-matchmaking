import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { WebSocketProvider, useWebSocket } from '../context/WebSocketContext'
import { notificationApi, chatApi } from '../services/api'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageCircle,
  Calendar,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Shield,
  Trophy,
  UsersRound,
} from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'

// Regular user navigation
const userNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/matches', icon: Users, label: 'Find Partners' },
  { path: '/friends', icon: UserCheck, label: 'Friends' },
  { path: '/groups', icon: UsersRound, label: 'Study Groups' },
  { path: '/chat', icon: MessageCircle, label: 'Messages' },
  { path: '/sessions', icon: Calendar, label: 'Sessions' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

// Admin-only navigation (monitoring + chat support)
const adminNavItems = [
  { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
  { path: '/chat', icon: MessageCircle, label: 'Support Chat' },
]

function LayoutContent() {
  const { user, logout } = useAuth()
  
  // Admin users only see admin panel, regular users see study features
  const navItems = user?.role === 'ADMIN' ? adminNavItems : userNavItems
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const { notifications: wsNotifications, messages: wsMessages } = useWebSocket()
  
  // Fetch unread count on mount and when showNotifications changes
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [])
  
  useEffect(() => {
    fetchUnreadCount()
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])
  
  // Update count when new WebSocket notification arrives
  useEffect(() => {
    if (wsNotifications.length > 0) {
      setUnreadCount(prev => prev + 1)
    }
  }, [wsNotifications])
  
  // Refresh count when notifications dropdown closes (user might have read them)
  useEffect(() => {
    if (!showNotifications) {
      fetchUnreadCount()
    }
  }, [showNotifications, fetchUnreadCount])
  
  // Fetch unread messages count
  const fetchUnreadMessagesCount = useCallback(async () => {
    try {
      const response = await chatApi.getConversations()
      const convs = response.data || []
      const totalUnread = convs.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
      setUnreadMessagesCount(totalUnread)
    } catch (error) {
      console.error('Failed to fetch unread messages count:', error)
    }
  }, [])
  
  useEffect(() => {
    fetchUnreadMessagesCount()
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadMessagesCount, 60000)
    return () => clearInterval(interval)
  }, [fetchUnreadMessagesCount])
  
  // Handle WebSocket messages for unread count
  useEffect(() => {
    if (wsMessages.length > 0) {
      if (location.pathname.startsWith('/chat')) {
        // User is on chat page - refresh count after a short delay 
        // (chat page will mark messages as read)
        const timer = setTimeout(() => {
          fetchUnreadMessagesCount()
        }, 500)
        return () => clearTimeout(timer)
      } else {
        // User is not on chat page - increment unread count
        setUnreadMessagesCount(prev => prev + 1)
      }
    }
  }, [wsMessages, location.pathname, fetchUnreadMessagesCount])
  
  // Refresh unread count when navigating to/within chat page
  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      // Small delay to let the chat page mark messages as read
      const timer = setTimeout(() => {
        fetchUnreadMessagesCount()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, fetchUnreadMessagesCount])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col glass border-r border-slate-200/50 dark:border-slate-700/50">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-gradient">Study Match</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Find your study partner</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 overflow-y-auto min-h-0 scroll-smooth-ios">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-3 rounded-xl transition-all duration-200 group relative no-select touch-target ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                  {/* Blue dot for unread messages */}
                  {item.path === '/chat' && unreadMessagesCount > 0 && (
                    <span className="absolute right-3 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </NavLink>
              ))}
            </nav>

            {/* User section - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <div
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={() => {
                  navigate('/profile')
                  setSidebarOpen(false)
                }}
              >
                <div className="avatar w-10 h-10 text-sm">
                  {getInitials(user?.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-700/50 safe-area-inset">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-target no-select"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                {/* Show logo on mobile header */}
                <div className="lg:hidden flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target no-select"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative touch-target no-select"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 w-2 h-2 bg-danger-500 rounded-full" />
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown 
                      onClose={() => setShowNotifications(false)} 
                      onRead={() => setUnreadCount(0)}
                    />
                  )}
                </div>

                <div
                  className="avatar w-9 h-9 text-sm cursor-pointer lg:hidden touch-target no-select"
                  onClick={() => navigate('/profile')}
                >
                  {getInitials(user?.displayName)}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto scroll-smooth-ios safe-area-inset">
            <Outlet />
          </main>
        </div>
      </div>
  )
}

export default function Layout() {
  return (
    <WebSocketProvider>
      <LayoutContent />
    </WebSocketProvider>
  )
}

