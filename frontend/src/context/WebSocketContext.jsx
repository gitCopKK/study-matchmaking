import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthContext'
import { API_URL } from '../services/api'

const WebSocketContext = createContext(null)

// Construct WebSocket URL from API URL
// In development: empty API_URL means use relative path (Vite proxy)
// In production: use full URL from VITE_API_URL
const getWebSocketUrl = () => {
  if (!API_URL) {
    return '/ws' // Local development - Vite proxy handles it
  }
  // For production, append /ws to the API URL
  return `${API_URL}/ws`
}

export function WebSocketProvider({ children }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [notifications, setNotifications] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [deliveryUpdates, setDeliveryUpdates] = useState([]) // For delivery confirmations
  const clientRef = useRef(null)
  const subscriptionsRef = useRef({})

  const connect = useCallback(() => {
    if (!user || clientRef.current?.connected) return

    const token = localStorage.getItem('token')
    const wsUrl = getWebSocketUrl()
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) console.log('STOMP:', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      setConnected(true)
      
      // Subscribe to personal messages
      client.subscribe(`/user/${user.id}/queue/messages`, (message) => {
        const data = JSON.parse(message.body)
        setMessages(prev => [...prev, data])
      })
      
      // Subscribe to typing indicators
      client.subscribe(`/user/${user.id}/queue/typing`, (message) => {
        const data = JSON.parse(message.body)
        setTypingUsers(prev => ({
          ...prev,
          [data.conversationId]: data.isTyping ? data.userId : null,
        }))
      })
      
      // Subscribe to presence updates
      client.subscribe('/topic/presence', (message) => {
        const data = JSON.parse(message.body)
        setOnlineUsers(prev => {
          const next = new Set(prev)
          if (data.online) {
            next.add(data.userId)
          } else {
            next.delete(data.userId)
          }
          return next
        })
      })
      
      // Subscribe to notifications (real-time)
      client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
        const data = JSON.parse(message.body)
        setNotifications(prev => [data, ...prev])
      })
      
      // Subscribe to delivery confirmations
      client.subscribe(`/user/${user.id}/queue/delivery`, (message) => {
        const data = JSON.parse(message.body)
        setDeliveryUpdates(prev => [...prev, data])
      })
      
      // Notify server we're online
      client.publish({
        destination: '/app/presence',
        body: JSON.stringify({ online: true }),
      })
    }

    client.onDisconnect = () => {
      setConnected(false)
    }

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers.message)
    }

    client.activate()
    clientRef.current = client

    return () => {
      if (client.connected) {
        client.publish({
          destination: '/app/presence',
          body: JSON.stringify({ online: false }),
        })
      }
      client.deactivate()
    }
  }, [user])

  useEffect(() => {
    const cleanup = connect()
    return () => cleanup?.()
  }, [connect])

  const sendMessage = useCallback((conversationId, content) => {
    if (!clientRef.current?.connected) return false
    
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ conversationId, content }),
    })
    return true
  }, [])

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!clientRef.current?.connected) return
    
    clientRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ conversationId, isTyping }),
    })
  }, [])

  const subscribeToConversation = useCallback((conversationId, callback) => {
    if (!clientRef.current?.connected) return () => {}
    
    const subscription = clientRef.current.subscribe(
      `/topic/conversation/${conversationId}`,
      (message) => {
        const data = JSON.parse(message.body)
        callback(data)
      }
    )
    
    subscriptionsRef.current[conversationId] = subscription
    
    return () => {
      subscription.unsubscribe()
      delete subscriptionsRef.current[conversationId]
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Seed online users from API data (used when loading conversations)
  const setOnlineUsersFromAPI = useCallback((userIds) => {
    setOnlineUsers(prev => {
      const next = new Set(prev)
      userIds.forEach(id => next.add(id))
      return next
    })
  }, [])

  const clearDeliveryUpdates = useCallback(() => {
    setDeliveryUpdates([])
  }, [])

  const value = {
    connected,
    messages,
    notifications,
    typingUsers,
    onlineUsers,
    deliveryUpdates,
    sendMessage,
    sendTyping,
    subscribeToConversation,
    clearMessages,
    clearNotifications,
    clearDeliveryUpdates,
    setOnlineUsersFromAPI,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

