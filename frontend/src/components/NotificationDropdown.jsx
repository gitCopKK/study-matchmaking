import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, MessageCircle, Users, Calendar, Check, CheckCheck } from 'lucide-react'
import { notificationApi } from '../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const iconMap = {
  MESSAGE: MessageCircle,
  MATCH: Users,
  SESSION: Calendar,
  DEFAULT: Bell,
}

export default function NotificationDropdown({ onClose, onRead }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const ref = useRef(null)

  useEffect(() => {
    loadNotifications()
    
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const loadNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications()
      setNotifications(response.data.content || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      onRead?.()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id)
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        )
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }

    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  const Icon = (type) => iconMap[type] || iconMap.DEFAULT

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto card animate-slide-down"
    >
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {notifications.map((notification) => {
            const NotifIcon = Icon(notification.type)
            return (
              <div
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.read
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <NotifIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dayjs(notification.createdAt).fromNow()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

