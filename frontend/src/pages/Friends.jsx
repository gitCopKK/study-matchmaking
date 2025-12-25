import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchApi, chatApi } from '../services/api'
import {
  UserCheck,
  MessageCircle,
  UserMinus,
  Users,
  RefreshCw,
  Search,
  Book,
  X,
  Check,
} from 'lucide-react'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingFriend, setRemovingFriend] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await matchApi.getMatches()
      setFriends(response.data || [])
    } catch (error) {
      console.error('Failed to load friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async (friend) => {
    if (!confirm(`Are you sure you want to remove ${friend.user?.displayName} as a friend?`)) {
      return
    }
    
    setRemovingFriend(friend.user?.id)
    try {
      await chatApi.removeMatch(friend.user?.id, true)
      setFriends(prev => prev.filter(f => f.id !== friend.id))
      setToast({ type: 'success', message: 'Friend removed successfully' })
    } catch (error) {
      console.error('Failed to remove friend:', error)
      setToast({ type: 'error', message: 'Failed to remove friend' })
    } finally {
      setRemovingFriend(null)
    }
  }

  const handleMessageFriend = async (friend) => {
    try {
      const convResponse = await chatApi.createConversation([friend.user.id])
      navigate(`/chat/${convResponse.data.id}`)
    } catch (error) {
      console.error('Failed to start conversation:', error)
      setToast({ type: 'error', message: 'Failed to start conversation' })
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      friend.user?.displayName?.toLowerCase().includes(query) ||
      friend.user?.username?.toLowerCase().includes(query) ||
      friend.user?.profile?.subjects?.some(s => s.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Loading your friends...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast Modal */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center bg-white dark:bg-slate-800">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              toast.type === 'success'
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
              {toast.type === 'success' ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <X className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              toast.type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {toast.type === 'success' ? 'Success!' : 'Oops!'}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className={`px-8 py-3 rounded-xl font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-slate-500">
            {friends.length} {friends.length === 1 ? 'connection' : 'connections'}
          </p>
        </div>
        <button
          onClick={loadFriends}
          disabled={loading}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      {friends.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends by name, username, or subject..."
            className="input pl-10 w-full"
          />
        </div>
      )}

      {/* Friends List */}
      {friends.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No friends yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Connect with study partners to add them as friends and start learning together!
          </p>
          <button
            onClick={() => navigate('/matches')}
            className="btn-primary"
          >
            <Users className="w-4 h-4" />
            Find Study Partners
          </button>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No friends match your search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFriends.map((friend) => (
            <div 
              key={friend.id} 
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="avatar w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-lg font-semibold flex-shrink-0">
                  {getInitials(friend.user?.displayName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-lg truncate">{friend.user?.displayName}</p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      Connected
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">@{friend.user?.username}</span>
                  </div>
                  {friend.user?.profile?.subjects?.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Book className="w-3.5 h-3.5 text-slate-400" />
                      <div className="flex flex-wrap gap-1">
                        {friend.user.profile.subjects.slice(0, 4).map(subject => (
                          <span key={subject} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">
                            {subject}
                          </span>
                        ))}
                        {friend.user.profile.subjects.length > 4 && (
                          <span className="text-xs text-slate-500">
                            +{friend.user.profile.subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleMessageFriend(friend)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-sm hover:shadow-md font-medium"
                    title="Send message"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(friend)}
                    disabled={removingFriend === friend.user?.id}
                    className="p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Remove friend"
                  >
                    {removingFriend === friend.user?.id ? (
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                      <UserMinus className="w-5 h-5 text-slate-400 hover:text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

