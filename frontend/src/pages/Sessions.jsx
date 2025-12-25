import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionApi, matchApi, chatApi } from '../services/api'
import {
  Calendar,
  Clock,
  Plus,
  X,
  MessageCircle,
  Users,
  Edit2,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react'
import dayjs from 'dayjs'

export default function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [formData, setFormData] = useState({
    title: '',
    partnerId: '',
    scheduledAt: '',
    durationMinutes: 60,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sessionsRes, matchesRes] = await Promise.all([
        sessionApi.getSessions(),
        matchApi.getMatches(),
      ])
      setSessions(sessionsRes.data || [])
      setPartners(matchesRes.data?.map(m => m.user) || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSession) {
        await sessionApi.update(editingSession.id, {
          title: formData.title,
          scheduledAt: formData.scheduledAt,
          durationMinutes: formData.durationMinutes,
        })
      } else {
        await sessionApi.create({
          title: formData.title,
          partnerId: formData.partnerId,
          scheduledAt: formData.scheduledAt,
          durationMinutes: formData.durationMinutes,
        })
      }
      setShowModal(false)
      setEditingSession(null)
      setFormData({ title: '', partnerId: '', scheduledAt: '', durationMinutes: 60 })
      loadData()
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  const handleJoinSession = async (session) => {
    try {
      // For 1-on-1 sessions, find or create conversation with partner
      if (session.partner?.id) {
        // Try to find existing conversation or create one
        const conversationsRes = await chatApi.getConversations()
        const conversations = conversationsRes.data || []
        
        // Find conversation with this partner
        const existingConv = conversations.find(conv => 
          conv.participants?.some(p => p.id === session.partner.id)
        )
        
        if (existingConv) {
          navigate(`/chat/${existingConv.id}`)
        } else {
          // Create new conversation
          const newConv = await chatApi.createConversation([session.partner.id])
          navigate(`/chat/${newConv.data.id}`)
        }
      } else {
        // Fallback to chat page
        navigate('/chat')
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      navigate('/chat')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      await sessionApi.delete(id)
      loadData()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const openEditModal = (session) => {
    setEditingSession(session)
    setFormData({
      title: session.title,
      partnerId: session.partner?.id,
      scheduledAt: dayjs(session.scheduledAt).format('YYYY-MM-DDTHH:mm'),
      durationMinutes: session.durationMinutes,
    })
    setShowModal(true)
  }

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  // Calendar helpers
  const daysInMonth = currentMonth.daysInMonth()
  const firstDayOfMonth = currentMonth.startOf('month').day()
  const today = dayjs()

  const getSessionsForDay = (day) => {
    const date = currentMonth.date(day)
    return sessions.filter(s => dayjs(s.scheduledAt).isSame(date, 'day'))
  }

  const upcomingSessions = sessions
    .filter(s => dayjs(s.scheduledAt).isAfter(today) && s.status !== 'CANCELLED')
    .sort((a, b) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            Study Sessions
          </h1>
          <p className="text-slate-500 mt-1">Schedule and manage your study sessions</p>
        </div>
        <button
          onClick={() => {
            setEditingSession(null)
            setFormData({ title: '', partnerId: '', scheduledAt: '', durationMinutes: 60 })
            setShowModal(true)
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg">
              {currentMonth.format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(dayjs())}
                className="px-3 py-1 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const date = currentMonth.date(day)
              const isToday = date.isSame(today, 'day')
              const daySessions = getSessionsForDay(day)
              
              return (
                <div
                  key={day}
                  className={`aspect-square p-1 rounded-lg border transition-colors ${
                    isToday
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`text-sm ${isToday ? 'font-bold text-primary-600' : ''}`}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {daySessions.filter(s => s.status !== 'CANCELLED').slice(0, 2).map(session => (
                      <div
                        key={session.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          session.groupSession
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                        }`}
                      >
                        {session.groupSession && '👥 '}{session.title}
                      </div>
                    ))}
                    {daySessions.filter(s => s.status !== 'CANCELLED').length > 2 && (
                      <div className="text-xs text-slate-500">
                        +{daySessions.filter(s => s.status !== 'CANCELLED').length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-500" />
            Upcoming
          </h2>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.slice(0, 5).map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{session.title}</p>
                        {session.groupSession && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        {session.groupSession ? (
                          <>
                            <Users className="w-3.5 h-3.5" />
                            {session.group?.name} ({session.participants?.length || 0} members)
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5" />
                            with {session.partner?.displayName}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(session)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="p-1 rounded hover:bg-danger-100 hover:text-danger-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {dayjs(session.scheduledAt).format('MMM D')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {dayjs(session.scheduledAt).format('h:mm A')}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleJoinSession(session)}
                    className="mt-3 w-full btn-primary py-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">
                {editingSession ? 'Edit Session' : 'New Study Session'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Session Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Physics Study Session"
                  className="input"
                  required
                />
              </div>

              {/* Partner selection - only show when creating */}
              {!editingSession && (
                <div>
                  <label className="label">Study Partner</label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select a partner</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* When editing, show current partner info */}
              {editingSession && (
                <div>
                  <label className="label">Study Partner</label>
                  <div className="py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {editingSession.partner?.displayName}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="label">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Duration</label>
                <select
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  className="input"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                >
                  <Check className="w-5 h-5" />
                  {editingSession ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

