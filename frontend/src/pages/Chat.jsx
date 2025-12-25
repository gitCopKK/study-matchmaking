import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWebSocket } from '../context/WebSocketContext'
import { chatApi } from '../services/api'
import { useToast } from '../components/Toast'
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  PhoneOff,
  BadgeCheck,
  Users,
  Plus,
  UserMinus,
  ShieldOff,
  UserX,
  Clock,
} from 'lucide-react'
import dayjs from 'dayjs'

export default function Chat() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const { connected, sendMessage, sendTyping, typingUsers, onlineUsers, deliveryUpdates, subscribeToConversation, setOnlineUsersFromAPI } = useWebSocket()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [showUserPicker, setShowUserPicker] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [deleteChat, setDeleteChat] = useState(true)
  
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const menuRef = useRef(null)
  
  const isAdmin = user?.role === 'ADMIN'

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId)
    }
  }, [conversationId])

  // Listen for new messages from WebSocket
  useEffect(() => {
    if (!conversationId || !connected) return
    
    const unsubscribe = subscribeToConversation(conversationId, (newMessage) => {
      // Only add if not from current user (we already added it optimistically)
      if (newMessage.senderId !== user?.id) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
        // Mark as read immediately since user is viewing this conversation
        chatApi.markAsRead(conversationId).catch(err => 
          console.error('Failed to mark as read:', err)
        )
      }
    })
    
    return () => unsubscribe()
  }, [conversationId, connected, subscribeToConversation, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle delivery status updates from WebSocket
  useEffect(() => {
    if (deliveryUpdates.length > 0) {
      const latestUpdate = deliveryUpdates[deliveryUpdates.length - 1]
      if (latestUpdate.conversationId === conversationId) {
        setMessages(prev => prev.map(msg => 
          msg.id === latestUpdate.messageId 
            ? { ...msg, status: latestUpdate.status, deliveredAt: latestUpdate.deliveredAt }
            : msg
        ))
      }
    }
  }, [deliveryUpdates, conversationId])

  const loadConversations = async () => {
    try {
      const response = await chatApi.getConversations()
      const convs = response.data || []
      setConversations(convs)
      
      // Seed online users from API data
      const onlineUserIds = convs.flatMap(conv => 
        conv.participants?.filter(p => p.isOnline && p.id !== user?.id).map(p => p.id) || []
      )
      if (onlineUserIds.length > 0) {
        setOnlineUsersFromAPI(onlineUserIds)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (convId) => {
    try {
      const response = await chatApi.getMessages(convId)
      // API returns DESC order, reverse to show oldest first
      const msgs = (response.data.content || []).reverse()
      setMessages(msgs)
      
      // Mark messages as delivered first, then as read
      await chatApi.markAsDelivered(convId).catch(() => {})
      await chatApi.markAsRead(convId)
      
      // Update local conversations state to reflect read status
      setConversations(prev => prev.map(conv => 
        conv.id === convId ? { ...conv, unreadCount: 0 } : conv
      ))
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const loadAllUsers = async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const response = await chatApi.getAllUsersForAdmin()
      // Filter out admin users from the list
      setAllUsers(response.data.filter(u => u.role !== 'ADMIN'))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const startConversationWithUser = async (userId) => {
    try {
      const response = await chatApi.createConversation([userId])
      setShowUserPicker(false)
      await loadConversations()
      navigate(`/chat/${response.data.id}`)
    } catch (error) {
      console.error('Failed to start conversation:', error)
      toast.error('Failed to start conversation')
    }
  }

  const handleRemoveMatch = async (shouldDeleteChat) => {
    if (!otherParticipant?.id) return
    
    try {
      await chatApi.removeMatch(otherParticipant.id, shouldDeleteChat)
      setShowRemoveConfirm(false)
      setShowMenu(false)
      setDeleteChat(true)  // Reset for next time
      toast.success(shouldDeleteChat 
        ? 'Match removed and chat deleted' 
        : 'Match removed (chat history kept)')
      // Reload conversations first to get fresh data, then navigate
      await loadConversations()
      navigate('/chat')
    } catch (error) {
      console.error('Failed to remove match:', error)
      toast.error(error.response?.data?.message || 'Failed to remove match')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversationId) return

    const messageContent = newMessage.trim()
    setSending(true)
    setNewMessage('') // Clear immediately for better UX
    
    try {
      // Always save via HTTP API to ensure persistence
      const response = await chatApi.sendMessage(conversationId, messageContent)
      
      // Add the saved message to local state
      setMessages(prev => [...prev, response.data])
      
      // Also try WebSocket for real-time delivery to other users
      if (connected) {
        sendMessage(conversationId, messageContent)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore the message if failed
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (conversationId) {
      sendTyping(conversationId, true)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false)
      }, 2000)
    }
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  }

  const currentConversation = conversations.find(c => c.id === conversationId)
  const otherParticipant = currentConversation?.participants?.find(p => p.id !== user?.id)
  const isTyping = typingUsers[conversationId]
  // Check WebSocket real-time status OR API status from participant data
  // Don't show online status for unmatched or deleted user conversations
  const isOnline = !currentConversation?.isUnmatched && !currentConversation?.isUserDeleted && otherParticipant && (onlineUsers.has(otherParticipant.id) || otherParticipant.isOnline)

  const filteredConversations = conversations.filter(conv => {
    const other = conv.participants?.find(p => p.id !== user?.id)
    return other?.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex rounded-xl sm:rounded-2xl overflow-hidden card">
      {/* Conversations Sidebar */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-700 flex flex-col ${
          conversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-base">
              {isAdmin ? 'Support Chat' : 'Messages'}
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setShowUserPicker(true)
                  loadAllUsers()
                }}
                className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                title="Start new chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Match with someone to start chatting!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = conv.participants?.find(p => p.id !== user?.id)
              const isActive = conv.id === conversationId
              // Check WebSocket real-time status OR API status from participant data
              // Don't show online status for unmatched or deleted user conversations
              const hasOnlineUser = !conv.isUnmatched && !conv.isUserDeleted && other && (onlineUsers.has(other.id) || other.isOnline)
              
              return (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className={`px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  } ${conv.isUserDeleted ? 'opacity-60' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`avatar w-10 h-10 text-sm ${conv.isUserDeleted ? 'grayscale' : ''}`}>
                      {getInitials(other?.displayName)}
                    </div>
                    {hasOnlineUser && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
                    )}
                    {conv.isUserDeleted && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-slate-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                        <UserX className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-sm truncate ${conv.isUserDeleted ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                        {other?.displayName}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-[11px] text-slate-400">
                          {dayjs(conv.lastMessage.sentAt).format('h:mm A')}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-slate-500 truncate mt-0.5">
                      {conv.isUserDeleted ? (
                        <span className="italic text-slate-400">Account deleted</span>
                      ) : conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && !conv.isUserDeleted && (
                    <div className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {conversationId ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-800">
            <button
              onClick={() => navigate('/chat')}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div 
              onClick={() => otherParticipant?.id && navigate(`/profile/${otherParticipant.id}`)}
              className="relative flex-shrink-0 cursor-pointer"
            >
              <div className="avatar w-9 h-9 text-sm hover:ring-2 hover:ring-primary-500 transition-all">
                {getInitials(otherParticipant?.displayName)}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p 
                onClick={() => otherParticipant?.id && navigate(`/profile/${otherParticipant.id}`)}
                className="font-semibold text-[15px] truncate cursor-pointer hover:text-primary-500 transition-colors"
              >
                {otherParticipant?.displayName}
              </p>
              <p className="text-[13px] text-slate-500">
                {currentConversation?.isUserDeleted ? (
                  <span className="text-slate-400">Account Deleted</span>
                ) : currentConversation?.isUnmatched ? (
                  <span className="text-red-400">Unmatched</span>
                ) : isTyping ? (
                  <span className="text-primary-500">typing...</span>
                ) : isOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => toast.info('Video calls coming soon!')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Video Call (Coming Soon)"
              >
                <Video className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toast.info('Audio calls coming soon!')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Audio Call (Coming Soon)"
              >
                <Phone className="w-4 h-4" />
              </button>
              
              {/* Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-fade-in">
                    {/* Only show remove match for non-admin chats that are not already unmatched */}
                    {!currentConversation?.isAdminChat && !currentConversation?.isUnmatched && (
                      <button
                        onClick={() => {
                          setShowRemoveConfirm(true)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove Match
                      </button>
                    )}
                    {(currentConversation?.isAdminChat || currentConversation?.isUnmatched) && (
                      <div className="px-4 py-2.5 text-sm text-slate-400">
                        No options available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {messages.map((message, index) => {
              const isOwn = message.senderId === user?.id
              const showAvatar = !isOwn && (
                index === 0 || messages[index - 1]?.senderId !== message.senderId
              )
              const showTime = index === 0 || 
                messages[index - 1]?.senderId !== message.senderId ||
                dayjs(message.sentAt).diff(dayjs(messages[index - 1]?.sentAt), 'minute') > 5
              
              // Check if message is a video call invite
              const isVideoCallStart = message.content?.includes('📹 Started a video call')
              const isCallEnded = message.content?.includes('📞 Call ended')
              const videoCallLink = message.content?.match(/\/video\/([a-zA-Z0-9-]+)/)?.[0]
              
              // Check if there's a "call ended" message after this video call start
              const callEndedAfterThis = isVideoCallStart && messages.slice(index + 1).some(
                m => m.content?.includes('📞 Call ended')
              )
              
              // Check if call is still joinable (within 5 minutes and not ended)
              const callAge = dayjs().diff(dayjs(message.sentAt), 'minute')
              const isCallJoinable = isVideoCallStart && !callEndedAfterThis && callAge < 5
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && (
                    <div className={`w-6 ${showAvatar ? '' : 'invisible'}`}>
                      <div className="avatar w-6 h-6 text-[10px]">
                        {getInitials(otherParticipant?.displayName)}
                      </div>
                    </div>
                  )}
                  
                  {isCallEnded ? (
                    // Call ended message
                    <div
                      className={`max-w-[75%] rounded-2xl overflow-hidden ${
                        isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                    >
                      <div className="bg-slate-200 dark:bg-slate-600 p-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <PhoneOff className="w-4 h-4" />
                          <span className="text-sm">{message.content}</span>
                        </div>
                      </div>
                    </div>
                  ) : isVideoCallStart ? (
                    // Video call invitation card
                    <div
                      className={`max-w-[75%] rounded-2xl overflow-hidden ${
                        isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                      }`}
                    >
                      <div className={`p-3 text-white ${
                        callEndedAfterThis || !isCallJoinable
                          ? 'bg-slate-400 dark:bg-slate-600'
                          : 'bg-gradient-to-r from-primary-500 to-primary-600'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="w-5 h-5" />
                          <span className="font-medium text-sm">Video Call</span>
                          {(callEndedAfterThis || !isCallJoinable) && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Ended</span>
                          )}
                        </div>
                        <p className="text-xs text-white/80 mb-2">
                          {isOwn ? 'You started a video call' : `${otherParticipant?.displayName} started a video call`}
                        </p>
                        <p className="text-xs text-white/60 text-center">Video calls coming soon</p>
                      </div>
                      <div className={`px-3 py-1 text-[11px] ${
                        callEndedAfterThis || !isCallJoinable
                          ? 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                          : isOwn ? 'bg-primary-600 text-white/60' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {dayjs(message.sentAt).format('h:mm A')}
                      </div>
                    </div>
                  ) : (
                    // Regular message
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-slate-100 dark:bg-slate-700 rounded-bl-md'
                      }`}
                    >
                      {/* Show admin verified badge for admin messages */}
                      {message.senderRole === 'ADMIN' && (
                        <div className={`flex items-center gap-1 mb-1 ${isOwn ? 'text-white/80' : 'text-blue-500'}`}>
                          <BadgeCheck className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">Admin</span>
                        </div>
                      )}
                      <p className="break-words text-sm leading-relaxed">{message.content}</p>
                      <div
                        className={`flex items-center gap-0.5 mt-0.5 ${
                          isOwn ? 'justify-end' : ''
                        }`}
                      >
                        <span className={`text-[11px] ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                          {dayjs(message.sentAt).format('h:mm A')}
                        </span>
                        {isOwn && (
                          // Message status: SENDING -> SENT -> DELIVERED -> READ
                          message.status === 'SENDING' ? (
                            <Clock className="w-3.5 h-3.5 text-white/40 animate-pulse" />
                          ) : message.isRead || message.status === 'READ' ? (
                            <CheckCheck className="w-4 h-4 text-green-400 drop-shadow-sm" title="Read" />
                          ) : message.status === 'DELIVERED' ? (
                            <CheckCheck className="w-4 h-4 text-white/70" title="Delivered" />
                          ) : (
                            <Check className="w-4 h-4 text-white/50" title="Sent" />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {isTyping && (
              <div className="flex items-center gap-1.5">
                <div className="avatar w-6 h-6 text-[10px]">
                  {getInitials(otherParticipant?.displayName)}
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-0.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input or Blocked State */}
          {currentConversation?.isUserDeleted ? (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                <UserX className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {otherParticipant?.displayName} has deleted their account
                </span>
              </div>
              <p className="text-xs text-slate-500/70 dark:text-slate-400/70 text-center mt-1">
                You can no longer send messages to this user
              </p>
            </div>
          ) : currentConversation?.isUnmatched ? (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                <ShieldOff className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {currentConversation?.unmatchedByOtherUser 
                    ? `${otherParticipant?.displayName} has unmatched with you`
                    : `You have unmatched ${otherParticipant?.displayName}`
                  }
                </span>
              </div>
              <p className="text-xs text-red-500/70 dark:text-red-400/70 text-center mt-1">
                You can no longer send messages in this conversation
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 safe-area-inset">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2.5 text-base sm:text-sm rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-slate-400"
                  style={{ fontSize: '16px' }} /* Prevent iOS zoom */
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 sm:p-2.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
                >
                  <Send className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
              {!connected && (
                <p className="text-[11px] text-amber-500 mt-1.5 text-center">
                  ⚠️ Connecting...
                </p>
              )}
            </form>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-500">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">
              {isAdmin ? 'Choose a user to chat with or start a new conversation' : 'Choose from your existing conversations'}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setShowUserPicker(true)
                  loadAllUsers()
                }}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Picker Modal (Admin Only) */}
      {showUserPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select User to Chat
              </h3>
              <button
                onClick={() => setShowUserPicker(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input mb-4"
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : allUsers.filter(u => 
                  u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((u) => (
                <div
                  key={u.id}
                  onClick={() => startConversationWithUser(u.id)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="avatar w-10 h-10 text-sm">
                    {u.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{u.displayName}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
              ))}
              {!loadingUsers && allUsers.length === 0 && (
                <p className="text-center text-slate-500 py-8">No users found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Match Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <UserMinus className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Remove Match?</h3>
            <p className="text-sm text-slate-500 text-center mb-4">
              This will unmatch you from <span className="font-medium text-slate-700 dark:text-slate-300">{otherParticipant?.displayName}</span>.
            </p>
            
            {/* Delete chat option */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteChat}
                  onChange={(e) => setDeleteChat(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-500 rounded border-slate-300 focus:ring-red-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Delete chat history
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {deleteChat 
                      ? "Your conversation will be removed from your chat list"
                      : "You'll keep the chat history but won't be able to send new messages"}
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveConfirm(false)
                  setDeleteChat(true)  // Reset
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMatch(deleteChat)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

