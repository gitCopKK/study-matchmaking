import { useState, useEffect } from 'react'
import { activityApi, badgeApi } from '../services/api'
import { useToast } from '../components/Toast'
import {
  Flame,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  X,
  Check,
  Award,
  Target,
  AlertTriangle,
  Timer,
  BookOpen,
  Trophy,
  Lock,
  ChevronRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import dayjs from 'dayjs'

const TOPICS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Economics', 'History', 'Literature', 'Languages', 'Other',
]

export default function Activity() {
  const toast = useToast()
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({ 
    streak: 0, 
    totalMinutes: 0, 
    daysActive: 0,
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
    todayMinutes: 0,
    weekMinutes: 0,
    streakAtRisk: false,
    studiedToday: false,
  })
  const [badges, setBadges] = useState({ earnedBadges: [], availableBadges: [], totalEarned: 0, totalAvailable: 0 })
  const [loading, setLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState(null)
  
  // Log mode: 'duration' or 'timerange'
  const [logMode, setLogMode] = useState('duration')
  const [logData, setLogData] = useState({
    activityDate: dayjs().format('YYYY-MM-DD'),
    studyMinutes: 60,
    startTime: '09:00',
    endTime: '10:00',
    topicsStudied: [],
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const endDate = dayjs().format('YYYY-MM-DD')
      const startDate = dayjs().subtract(365, 'day').format('YYYY-MM-DD')
      
      const [activitiesRes, statsRes, badgesRes] = await Promise.all([
        activityApi.getActivities(startDate, endDate),
        activityApi.getStats(),
        badgeApi.getBadges(),
      ])
      
      setActivities(activitiesRes.data || [])
      setStats(statsRes.data || { streak: 0, totalMinutes: 0, daysActive: 0 })
      setBadges(badgesRes.data || { earnedBadges: [], availableBadges: [], totalEarned: 0, totalAvailable: 0 })
    } catch (error) {
      console.error('Failed to load activity data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogActivity = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        activityDate: logData.activityDate,
        topicsStudied: logData.topicsStudied,
        notes: logData.notes || null,
      }
      
      if (logMode === 'duration') {
        payload.studyMinutes = logData.studyMinutes
      } else {
        payload.startTime = logData.startTime
        payload.endTime = logData.endTime
      }
      
      await activityApi.logActivity(payload)
      
      // Check for new badges
      const unseenRes = await badgeApi.getUnseenBadges()
      if (unseenRes.data && unseenRes.data.length > 0) {
        for (const badge of unseenRes.data) {
          toast.success(`🏆 New Badge: ${badge.emoji} ${badge.name}!`)
        }
        await badgeApi.markBadgesAsSeen()
      }
      
      setShowLogModal(false)
      setLogData({
        activityDate: dayjs().format('YYYY-MM-DD'),
        studyMinutes: 60,
        startTime: '09:00',
        endTime: '10:00',
        topicsStudied: [],
        notes: '',
      })
      loadData()
      toast.success('Study time logged successfully!')
    } catch (error) {
      console.error('Failed to log activity:', error)
      toast.error(error.response?.data?.message || 'Failed to log activity')
    }
  }

  // Generate heatmap data for the last 52 weeks
  const generateHeatmapData = () => {
    const weeks = []
    const today = dayjs()
    const startOfWeek = today.subtract(51, 'week').startOf('week')

    for (let week = 0; week < 52; week++) {
      const days = []
      for (let day = 0; day < 7; day++) {
        const date = startOfWeek.add(week, 'week').add(day, 'day')
        const activity = activities.find(a => dayjs(a.activityDate).isSame(date, 'day'))
        days.push({
          date: date.format('YYYY-MM-DD'),
          minutes: activity?.studyMinutes || 0,
          level: getActivityLevel(activity?.studyMinutes || 0),
        })
      }
      weeks.push(days)
    }

    return weeks
  }

  const getActivityLevel = (minutes) => {
    if (minutes === 0) return 0
    if (minutes < 30) return 1
    if (minutes < 60) return 2
    if (minutes < 120) return 3
    return 4
  }

  const levelColors = [
    'bg-slate-100 dark:bg-slate-700',
    'bg-primary-200 dark:bg-primary-900',
    'bg-primary-300 dark:bg-primary-700',
    'bg-primary-500 dark:bg-primary-500',
    'bg-primary-600 dark:bg-primary-400',
  ]

  // Weekly chart data
  const getWeeklyChartData = () => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      const activity = activities.find(a => dayjs(a.activityDate).isSame(date, 'day'))
      data.push({
        day: date.format('ddd'),
        minutes: activity?.studyMinutes || 0,
      })
    }
    return data
  }

  const heatmapData = generateHeatmapData()
  const weeklyData = getWeeklyChartData()
  
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
    <div className="space-y-6 animate-fade-in">
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
          <button onClick={() => setShowLogModal(true)} className="bg-white text-orange-600 px-4 py-2 rounded-xl font-medium hover:bg-orange-50 transition-colors">
            Log Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-500" />
            Study Activity
          </h1>
          <p className="text-slate-500 mt-1">Track your study progress and maintain streaks</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          Log Study Time
        </button>
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
          {dailyProgress >= 100 && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" /> Daily goal achieved! 🎉
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
          {weeklyProgress >= 100 && (
            <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" /> Weekly goal achieved! 🎉
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-sm text-slate-500">Day Streak</p>
            </div>
          </div>
          {stats.streak >= 7 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-orange-500">
              <Award className="w-4 h-4" />
              <span>On fire! Keep it up!</span>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(stats.totalMinutes / 60)}h</p>
              <p className="text-sm text-slate-500">This Week</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.daysActive}</p>
              <p className="text-sm text-slate-500">Days Active</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{badges.totalEarned}</p>
              <p className="text-sm text-slate-500">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Your Badges
          </h2>
          <span className="text-sm text-slate-500">{badges.totalEarned} / {badges.totalAvailable} earned</span>
        </div>
        
        {/* Earned Badges */}
        {badges.earnedBadges.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Earned</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {badges.earnedBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => { setSelectedBadge(badge); setShowBadgeModal(true); }}
                  className="group flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 transition-all hover:scale-105"
                >
                  <span className="text-3xl mb-1">{badge.emoji}</span>
                  <span className="text-xs font-medium text-center line-clamp-2">{badge.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Badges */}
        {badges.availableBadges.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Available</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {badges.availableBadges.slice(0, 10).map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => { setSelectedBadge(badge); setShowBadgeModal(true); }}
                  className="group flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all hover:scale-105 opacity-60 hover:opacity-100"
                >
                  <div className="relative">
                    <span className="text-3xl mb-1 grayscale">{badge.emoji}</span>
                    <Lock className="w-4 h-4 absolute -bottom-1 -right-1 text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-center line-clamp-2 text-slate-500">{badge.name}</span>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${badge.progressPercentage || 0}%` }}
                    />
                  </div>
                </button>
              ))}
              {badges.availableBadges.length > 10 && (
                <button
                  onClick={() => { setSelectedBadge(null); setShowBadgeModal(true); }}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-400 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                  <span className="text-xs text-slate-500">+{badges.availableBadges.length - 10} more</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">
          Study Activity Heatmap
        </h2>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-slate-500">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="flex-1 text-center">
                  {month}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-xs text-slate-500 pr-2">
                <span className="h-3"></span>
                <span className="h-3">Mon</span>
                <span className="h-3"></span>
                <span className="h-3">Wed</span>
                <span className="h-3"></span>
                <span className="h-3">Fri</span>
                <span className="h-3"></span>
              </div>
              
              {/* Cells */}
              <div className="flex-1 flex gap-[3px]">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <div
                        key={day.date}
                        className={`w-3 h-3 rounded-sm ${levelColors[day.level]} cursor-pointer hover:ring-2 hover:ring-primary-400`}
                        title={`${day.date}: ${day.minutes} minutes`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
              <span>Less</span>
              {levelColors.map((color, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg mb-4">
          This Week's Progress
        </h2>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="day" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="card p-3 text-sm">
                        <p className="font-medium">{payload[0].payload.day}</p>
                        <p className="text-primary-500">{payload[0].value} minutes</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="minutes"
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">Log Study Time</h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogActivity} className="space-y-4">
              {/* Date Picker */}
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={logData.activityDate}
                  onChange={(e) => setLogData({ ...logData, activityDate: e.target.value })}
                  max={dayjs().format('YYYY-MM-DD')}
                  min={dayjs().subtract(30, 'day').format('YYYY-MM-DD')}
                  className="input"
                  required
                />
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="label">Log Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogMode('duration')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      logMode === 'duration'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    Duration
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode('timerange')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      logMode === 'timerange'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Time Range
                  </button>
                </div>
              </div>

              {/* Duration Input */}
              {logMode === 'duration' && (
                <div>
                  <label className="label">Study Duration (minutes)</label>
                  <input
                    type="number"
                    value={logData.studyMinutes}
                    onChange={(e) => setLogData({ ...logData, studyMinutes: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="720"
                    className="input"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Quick: 
                    {[15, 30, 60, 120].map(min => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setLogData({ ...logData, studyMinutes: min })}
                        className="ml-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs"
                      >
                        {min}m
                      </button>
                    ))}
                  </p>
                </div>
              )}

              {/* Time Range Input */}
              {logMode === 'timerange' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Time</label>
                    <input
                      type="time"
                      value={logData.startTime}
                      onChange={(e) => setLogData({ ...logData, startTime: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">End Time</label>
                    <input
                      type="time"
                      value={logData.endTime}
                      onChange={(e) => setLogData({ ...logData, endTime: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Topics */}
              <div>
                <label className="label">Topics Studied</label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        const topics = logData.topicsStudied.includes(topic)
                          ? logData.topicsStudied.filter(t => t !== topic)
                          : [...logData.topicsStudied, topic]
                        setLogData({ ...logData, topicsStudied: topics })
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        logData.topicsStudied.includes(topic)
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  value={logData.notes}
                  onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                  placeholder="What did you study? Any reflections?"
                  className="input h-20 resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Check className="w-5 h-5" />
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-scale-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">
                {selectedBadge ? 'Badge Details' : 'All Badges'}
              </h2>
              <button
                onClick={() => { setShowBadgeModal(false); setSelectedBadge(null); }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedBadge ? (
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${
                  selectedBadge.earned 
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30' 
                    : 'bg-slate-100 dark:bg-slate-800'
                } mb-4`}>
                  <span className={`text-5xl ${!selectedBadge.earned && 'grayscale'}`}>{selectedBadge.emoji}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{selectedBadge.name}</h3>
                <p className="text-slate-500 mb-4">{selectedBadge.description}</p>
                
                {selectedBadge.earned ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                    <Check className="w-4 h-4" />
                    Earned {dayjs(selectedBadge.earnedAt).format('MMM D, YYYY')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${selectedBadge.progressPercentage || 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      {selectedBadge.currentProgress} / {selectedBadge.threshold} ({selectedBadge.progressPercentage}%)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {badges.availableBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <span className="text-3xl grayscale">{badge.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm text-slate-500">{badge.description}</p>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${badge.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
