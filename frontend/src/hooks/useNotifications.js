import { useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../services/api'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ])
      setNotifications(notifRes.data.content || [])
      setUnreadCount(countRes.data.count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh: fetchNotifications,
  }
}

