import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { matchApi, sessionApi, activityApi, badgeApi } from '../services/api'
import {
  Users,
  Calendar,
  Flame,
  ArrowRight,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  AlertTriangle,
  Trophy,
  Check,
} from 'lucide-react'
import dayjs from 'dayjs'

export default function Dashboard() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [stats, setStats] = useState({ 
    streak: 0, 
    totalMinutes: 0, 
    sessionsThisWeek: 0, 
    friendsCount: 0,
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
    todayMinutes: 0,
    weekMinutes: 0,
    streakAtRisk: false,
    studiedToday: false,
  })
  const [unseenBadges, setUnseenBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchesLoading, setMatchesLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load fast data first (stats + sessions) - show dashboard immediately
      const [sessionRes, statsRes, unseenRes] = await Promise.all([
        sessionApi.getUpcoming().catch(() => ({ data: [] })),
        activityApi.getStats().catch(() => ({ data: { streak: 0, totalMinutes: 0, sessionsThisWeek: 0, friendsCount: 0 } })),
        badgeApi.getUnseenBadges().catch(() => ({ data: [] })),
      ])
      setUpcomingSessions(sessionRes.data?.slice(0, 3) || [])
      setStats(statsRes.data || { streak: 0, totalMinutes: 0, sessionsThisWeek: 0, friendsCount: 0 })
      setUnseenBadges(unseenRes.data || [])
      setLoading(false) // Show dashboard immediately!
      
      // Load matches separately (non-blocking) - this is the slow part
      const matchRes = await matchApi.getSuggestions().catch(() => ({ data: [] }))
      setMatches(matchRes.data?.slice(0, 3) || [])
      setMatchesLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setLoading(false)
      setMatchesLoading(false)
    }
  }

  const handleDismissBadges = async () => {
    try {
      await badgeApi.markBadgesAsSeen()
      setUnseenBadges([])
    } catch (error) {
      console.error('Failed to dismiss badges:', error)
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

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Goal progress calculations
  const dailyProgress = stats.dailyGoalMinutes > 0 
    ? Math.min(100, Math.round((stats.todayMinutes / stats.dailyGoalMinutes) * 100))
    : 0
  const weeklyProgress = stats.weeklyGoalMinutes > 0
    ? Math.min(100, Math.round((stats.weekMinutes / stats.weeklyGoalMinutes) * 100))
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* New Badges Notification */}
      {unseenBadges.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="flex -space-x-2">
              {unseenBadges.slice(0, 3).map((badge, i) => (
                <div key={i} className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl ring-2 ring-white">
                  {badge.emoji}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">🎉 New Badge{unseenBadges.length > 1 ? 's' : ''} Earned!</h3>
              <p className="text-white/80 text-sm">
                {unseenBadges.map(b => `${b.emoji} ${b.name}`).join(', ')}
              </p>
            </div>
            <button 
              onClick={handleDismissBadges}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Streak At Risk Warning */}
      {stats.streakAtRisk && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Your {stats.streak}-day streak is at risk! 🔥</h3>
            <p className="text-white/80 text-sm">Log some study time today to keep your streak alive.</p>
          </div>
          <Link to="/activity" className="bg-white text-orange-600 px-4 py-2 rounded-xl font-medium hover:bg-orange-50 transition-colors">
            Log Now
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">
            {greeting()}, {user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Ready to find your perfect study partner today?
          </p>
        </div>
        <Link to="/matches" className="btn-primary w-full sm:w-auto justify-center touch-target">
          <Users className="w-5 h-5" />
          Find Partners
        </Link>
      </div>

      {/* Goal Progress Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <span className="font-medium">Daily Goal</span>
            </div>
            <span className="text-sm text-slate-500">{stats.todayMinutes} / {stats.dailyGoalMinutes} min</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                dailyProgress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-primary-400 to-primary-500'
              }`}
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
          {dailyProgress >= 100 ? (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" /> Daily goal achieved! 🎉
            </p>
          ) : dailyProgress > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {stats.dailyGoalMinutes - stats.todayMinutes} min to go
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-500" />
              <span className="font-medium">Weekly Goal</span>
            </div>
            <span className="text-sm text-slate-500">{Math.round(stats.weekMinutes / 60 * 10) / 10}h / {Math.round(stats.weeklyGoalMinutes / 60)}h</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                weeklyProgress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-accent-400 to-accent-500'
              }`}
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
          {weeklyProgress >= 100 ? (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" /> Weekly goal achieved! 🎉
            </p>
          ) : weeklyProgress > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {Math.round((stats.weeklyGoalMinutes - stats.weekMinutes) / 60 * 10) / 10}h to go
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.streak}</p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">This Week</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.sessionsThisWeek}</p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Sessions</p>
            </div>
          </div>
        </div>

        <div className="card p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold">{stats.friendsCount}</p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Friends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Match Suggestions */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="font-display font-semibold text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" />
              Top Matches
            </h2>
            <Link to="/matches" className="text-primary-500 hover:text-primary-600 text-xs sm:text-sm font-medium flex items-center gap-1 touch-target">
              View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {matchesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No matches yet. Complete your profile to find partners!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="avatar w-12 h-12">
                    {getInitials(match.user?.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{match.user?.displayName}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {match.user?.profile?.subjects?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-500">
                      {match.compatibilityScore}%
                    </div>
                    <p className="text-xs text-slate-500">Match</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Upcoming Sessions
            </h2>
            <Link to="/sessions" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions. Schedule one with your study partner!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        with {session.partner?.displayName}
                      </p>
                    </div>
                    <span className="badge-primary">
                      {session.durationMinutes}min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    {dayjs(session.scheduledAt).format('ddd, MMM D • h:mm A')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Link
          to="/matches"
          className="card p-3 sm:p-5 hover:shadow-lg active:scale-[0.98] sm:hover:-translate-y-1 transition-all group no-select touch-target"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-sm sm:text-base">Find Partners</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Browse matches</p>
        </Link>

        <Link
          to="/sessions"
          className="card p-3 sm:p-5 hover:shadow-lg active:scale-[0.98] sm:hover:-translate-y-1 transition-all group no-select touch-target"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-sm sm:text-base">Schedule</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Plan a session</p>
        </Link>

        <Link
          to="/activity"
          className="card p-3 sm:p-5 hover:shadow-lg active:scale-[0.98] sm:hover:-translate-y-1 transition-all group no-select touch-target"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-sm sm:text-base">Log Study</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Track progress</p>
        </Link>

        <Link
          to="/chat"
          className="card p-3 sm:p-5 hover:shadow-lg active:scale-[0.98] sm:hover:-translate-y-1 transition-all group no-select touch-target"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-sm sm:text-base">Messages</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">Chat with partners</p>
        </Link>
      </div>
    </div>
  )
}
