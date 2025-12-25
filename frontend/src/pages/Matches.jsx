import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { matchApi, chatApi, userApi } from '../services/api'
import {
  Heart,
  X,
  Users,
  Clock,
  Book,
  Brain,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Zap,
  Lightbulb,
  Target,
  Flame,
  Search,
  UserPlus,
  Inbox,
  Check,
} from 'lucide-react'

const LEARNING_STYLES = {
  visual: 'Visual',
  reading: 'Reading/Writing',
  auditory: 'Auditory',
  kinesthetic: 'Hands-on',
  collaborative: 'Collaborative',
  solo: 'Solo',
}

export default function Matches() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [requests, setRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [direction, setDirection] = useState(null) // 'left' or 'right' for animation
  const [sendingRequest, setSendingRequest] = useState(null)
  const [cooldownErrors, setCooldownErrors] = useState({}) // userId -> { days, message }
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message: string }
  const navigate = useNavigate()

  useEffect(() => {
    loadSuggestions()
    loadRequests()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const loadSuggestions = async (forceRefresh = false) => {
    try {
      setLoading(true)
      let response
      if (forceRefresh) {
        response = await matchApi.refreshSuggestions()
      } else {
        response = await matchApi.getSuggestions()
        if (!response.data || response.data.length === 0) {
          response = await matchApi.refreshSuggestions()
        }
      }
      setSuggestions(response.data || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      const response = await matchApi.getRequests()
      setRequests(response.data || [])
    } catch (error) {
      console.error('Failed to load requests:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      const response = await userApi.search(searchQuery)
      setSearchResults(response.data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (userId) => {
    console.log('Sending request to user:', userId)
    setSendingRequest(userId)
    try {
      const response = await matchApi.sendRequest(userId)
      console.log('Request sent successfully:', response.data)
      // Update search results to reflect pending status
      setSearchResults(prev => prev.map(u => 
        u.id === userId ? { ...u, matchStatus: 'PENDING' } : u
      ))
      // Clear any previous cooldown error for this user
      setCooldownErrors(prev => {
        const updated = { ...prev }
        delete updated[userId]
        return updated
      })
      // Show success toast
      setToast({ type: 'success', message: 'Connection request sent! 🎉' })
    } catch (error) {
      console.error('Failed to send request:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to send request'
      console.error('Error message:', errorMessage)
      
      // Check if it's a cooldown error (format: "COOLDOWN:days:message")
      if (typeof errorMessage === 'string' && errorMessage.startsWith('COOLDOWN:')) {
        const parts = errorMessage.split(':')
        const days = parseInt(parts[1], 10)
        const message = parts.slice(2).join(':')
        setCooldownErrors(prev => ({
          ...prev,
          [userId]: { days, message }
        }))
      } else {
        // Show error toast
        setToast({ type: 'error', message: typeof errorMessage === 'string' ? errorMessage : 'Failed to send request' })
      }
    } finally {
      setSendingRequest(null)
    }
  }

  const handleAccept = async (match) => {
    setActing(true)
    setDirection('right')
    try {
      let result
      if (match.status === 'SUGGESTION') {
        // For suggestions, send a match request (creates a pending request for the other user)
        result = await matchApi.sendRequest(match.user.id)
        console.log('Send request result:', result.data)
        
        // Show success toast
        setToast({ type: 'success', message: `Request sent to ${match.user?.displayName}! 🎉` })
        
        // Move to next suggestion
        setTimeout(() => {
          if (currentIndex < suggestions.length - 1) {
            setCurrentIndex(prev => prev + 1)
          } else {
            setSuggestions(prev => prev.filter(s => s.id !== match.id))
          }
          setDirection(null)
          setActing(false)
        }, 300)
      } else {
        // For pending requests, accept the match (makes it mutual)
        result = await matchApi.accept(match.id)
        console.log('Accept result:', result.data)
        
        if (result.data.status === 'MUTUAL') {
          // Remove from requests list
          if (activeTab === 'requests') {
            setRequests(prev => prev.filter(r => r.id !== match.id))
          }
          
          // Create conversation for mutual match after a brief delay
          setTimeout(async () => {
            try {
              const convResponse = await chatApi.createConversation([match.user.id])
              navigate(`/chat/${convResponse.data.id}`)
            } catch (err) {
              console.error('Failed to create conversation:', err)
              navigate('/chat')
            }
          }, 1500)
        } else {
          // Just accepted, waiting for other user (shouldn't happen with new logic)
          setTimeout(() => {
            if (activeTab === 'requests') {
              setRequests(prev => prev.filter(r => r.id !== match.id))
            } else {
              if (currentIndex < suggestions.length - 1) {
                setCurrentIndex(prev => prev + 1)
              } else {
                setSuggestions(prev => prev.filter(s => s.id !== match.id))
              }
            }
            setDirection(null)
            setActing(false)
          }, 300)
        }
      }
    } catch (error) {
      console.error('Failed to accept match:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to send request. Please try again.'
      setToast({ type: 'error', message: typeof errorMessage === 'string' ? errorMessage : 'Failed to send request' })
      setDirection(null)
      setActing(false)
    }
  }

  const handleDecline = async (match) => {
    setActing(true)
    setDirection('left')
    try {
      // For suggestions, there's no match record to decline - just skip to next
      if (match.status === 'SUGGESTION') {
        setTimeout(() => {
          if (currentIndex < suggestions.length - 1) {
            setCurrentIndex(prev => prev + 1)
          } else {
            setSuggestions(prev => prev.filter(s => s.id !== match.id))
          }
          setDirection(null)
          setActing(false)
        }, 300)
        return
      }
      
      // For pending requests, decline the match
      await matchApi.decline(match.id)
      
      setTimeout(() => {
        if (activeTab === 'requests') {
          setRequests(prev => prev.filter(r => r.id !== match.id))
        } else {
          if (currentIndex < suggestions.length - 1) {
            setCurrentIndex(prev => prev + 1)
          } else {
            setSuggestions(prev => prev.filter(s => s.id !== match.id))
          }
        }
        setDirection(null)
        setActing(false)
      }, 300)
    } catch (error) {
      console.error('Failed to decline match:', error)
      setDirection(null)
      setActing(false)
    }
  }

  const nextCard = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  const currentMatch = suggestions[currentIndex]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Finding your matches...</p>
        </div>
      </div>
    )
  }

    return (
    <div className="max-w-2xl mx-auto px-0 sm:px-0">
      {/* Success/Error Modal */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`mx-4 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all ${
            toast.type === 'success' 
              ? 'bg-white dark:bg-slate-800' 
              : 'bg-white dark:bg-slate-800'
          }`}>
            {/* Icon */}
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
            
            {/* Title */}
            <h3 className={`text-2xl font-bold mb-2 ${
              toast.type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {toast.type === 'success' ? 'Request Sent!' : 'Oops!'}
            </h3>
            
            {/* Message */}
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {toast.type === 'success' 
                ? 'Your connection request has been sent. You\'ll be notified when they respond!'
                : toast.message
              }
            </p>
            
            {/* Button */}
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

      {/* Search Section */}
      <div className="mb-4 sm:mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="input pl-9 sm:pl-10 w-full text-sm sm:text-base"
              style={{ fontSize: '16px' }} /* Prevent iOS zoom */
            />
          </div>
          <button type="submit" className="btn-primary px-3 sm:px-4 touch-target" disabled={searching}>
            {searching ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Search</span>
                <Search className="w-5 h-5 sm:hidden" />
              </>
            )}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-slate-500">Search Results</h3>
              <button 
                onClick={() => setSearchResults([])}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="avatar w-12 h-12">
                  {getInitials(user.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.displayName}</p>
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">@{user.username}</span>
                  </div>
                  {user.profile?.subjects?.length > 0 && (
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {user.profile.subjects.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
                {user.matchStatus === 'MUTUAL' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    Connected
                  </span>
                ) : user.matchStatus === 'PENDING' || user.matchStatus === 'ACCEPTED' ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-sm font-medium">
                    Pending
                  </span>
                ) : user.matchStatus === 'DECLINED' && user.cooldownDaysRemaining ? (
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {user.cooldownDaysRemaining} day{user.cooldownDaysRemaining > 1 ? 's' : ''} left
                    </span>
                    <span className="text-xs text-slate-500 mt-1 max-w-[150px] text-right">
                      Request declined
                    </span>
                  </div>
                ) : cooldownErrors[user.id] ? (
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {cooldownErrors[user.id].days} day{cooldownErrors[user.id].days > 1 ? 's' : ''} left
                    </span>
                    <span className="text-xs text-slate-500 mt-1 max-w-[150px] text-right">
                      Request declined
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={sendingRequest === user.id}
                    className="btn-secondary text-sm flex items-center gap-1.5"
                  >
                    {sendingRequest === user.id ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => {
            setActiveTab('suggestions')
            setSearchParams({})
          }}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-all touch-target no-select text-sm sm:text-base ${
            activeTab === 'suggestions'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5 sm:mr-2" />
          <span className="hidden xs:inline">Suggestions</span>
          <span className="xs:hidden">Matches</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('requests')
            setSearchParams({ tab: 'requests' })
          }}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-all relative touch-target no-select text-sm sm:text-base ${
            activeTab === 'requests'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600'
          }`}
        >
          <Inbox className="w-4 h-4 inline mr-1.5 sm:mr-2" />
          Requests
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'suggestions' ? (
        <>
          {suggestions.length === 0 ? (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">No matches yet</h2>
        <p className="text-slate-500 mb-6">
          We're still finding the best study partners for you. 
          Make sure your profile is complete!
        </p>
        <button onClick={() => loadSuggestions(true)} className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
          ) : (
            <>
      {/* Header - Minimal */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Find Partners</h1>
          <p className="text-sm text-slate-500">
            {currentIndex + 1} of {suggestions.length}
          </p>
        </div>
        <button
          onClick={() => loadSuggestions(true)}
          disabled={loading}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Card Container - Fixed height container for stable arrows */}
      <div className="relative" style={{ minHeight: '580px' }}>
        {/* Navigation Arrows - Fixed position */}
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="absolute left-0 top-[280px] -translate-x-12 p-2 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-10 hidden md:block"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextCard}
          disabled={currentIndex >= suggestions.length - 1}
          className="absolute right-0 top-[280px] translate-x-12 p-2 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-10 hidden md:block"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Profile Card - Fixed minimum height */}
        <div 
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 min-h-[520px] flex flex-col ${
            direction === 'left' ? 'translate-x-[-100%] opacity-0 rotate-[-10deg]' :
            direction === 'right' ? 'translate-x-[100%] opacity-0 rotate-[10deg]' : ''
          }`}
        >
          {/* Top Section - Avatar & Basic Info */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-2xl font-semibold text-slate-600 dark:text-slate-300">
                  {getInitials(currentMatch?.user?.displayName)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold truncate">
                    {currentMatch?.user?.displayName}
                  </h2>
                  {currentMatch?.aiEnhanced && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      AI Match
                    </span>
                  )}
                </div>
                        
                        {currentMatch?.user?.username && (
                          <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">@{currentMatch.user.username}</span>
                          </div>
                        )}

                {/* Compatibility Score */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {currentMatch?.compatibilityScore}%
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">match</span>
                  </div>
                  
                  {currentMatch?.user?.profile?.studyStreak > 0 && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {currentMatch.user.profile.studyStreak} day streak
                    </div>
                  )}
                </div>

                {/* Match Reason */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  {currentMatch?.matchReason}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-700" />

          {/* Details Grid - flex-1 to fill available space */}
          <div className="p-6 pt-4 space-y-4 flex-1 overflow-y-auto">
            {/* Subjects */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Book className="w-4 h-4 text-slate-400" />
                Subjects
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMatch?.user?.profile?.subjects?.map((subject) => (
                  <span 
                    key={subject} 
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <Brain className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Learning Style</p>
                  <p className="text-sm font-medium">
                    {LEARNING_STYLES[currentMatch?.user?.profile?.learningStyle] || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <Target className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Goal</p>
                  <p className="text-sm font-medium">
                    {currentMatch?.user?.profile?.examGoal || 'General'}
                  </p>
                </div>
              </div>
            </div>

            {/* Preferred Times */}
            {currentMatch?.user?.profile?.preferredTimes?.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Prefers studying in the </span>
                <span className="font-medium">
                  {currentMatch.user.profile.preferredTimes.join(', ')}
                </span>
              </div>
            )}

            {/* AI Study Recommendations */}
            {currentMatch?.studyRecommendations?.length > 0 && (
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Topics to study together
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentMatch.studyRecommendations.map((topic, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-sm text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {currentMatch?.user?.profile?.bio && (
              <div className="text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-slate-200 dark:border-slate-600 pl-3">
                "{currentMatch.user.profile.bio}"
              </div>
            )}
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 mt-auto">
            <div className="flex items-center justify-center gap-6">
              {/* Decline */}
              <button
                onClick={() => handleDecline(currentMatch)}
                disabled={acting}
                className="group flex flex-col items-center gap-1"
              >
                <div className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:border-red-400 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-all">
                  <X className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
                </div>
                <span className="text-xs text-slate-500">Pass</span>
              </button>

              {/* Accept */}
              <button
                onClick={() => handleAccept(currentMatch)}
                disabled={acting}
                className="group flex flex-col items-center gap-1"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  {acting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Heart className="w-7 h-7 text-white" />
                  )}
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Connect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {suggestions.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-slate-800 dark:bg-white w-4'
                  : i < currentIndex
                  ? 'bg-slate-400'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
          {suggestions.length > 10 && (
            <span className="text-xs text-slate-400 ml-1">+{suggestions.length - 10}</span>
          )}
        </div>

        {/* Keyboard Hints */}
        <p className="text-center text-xs text-slate-400 mt-3">
          Use arrow keys to navigate • Press Enter to connect
        </p>
      </div>
            </>
          )}
        </>
      ) : (
        /* Pending requests list */
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No pending requests</h2>
              <p className="text-slate-500">
                When someone sends you a connection request, it will appear here.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Pending Requests ({requests.length})</h2>
              {requests.map((request) => (
                <div key={request.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="avatar w-14 h-14">
                      {getInitials(request.user?.displayName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{request.user?.displayName}</p>
                      <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">@{request.user?.username}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{request.matchReason}</p>
                      {request.user?.profile?.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.user.profile.subjects.slice(0, 3).map(subject => (
                            <span key={subject} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400">
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAccept(request)}
                        disabled={acting}
                        className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleDecline(request)}
                        disabled={acting}
                        className="p-2 rounded-full border-2 border-slate-200 dark:border-slate-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <X className="w-5 h-5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
