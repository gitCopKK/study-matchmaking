import { useState, useEffect } from 'react'
import api, { adminApi, bugReportApi } from '../services/api'
import {
  Users,
  MessageCircle,
  Calendar,
  Zap,
  Shield,
  ShieldOff,
  Activity,
  BarChart3,
  Coins,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
  Bot,
  Settings,
  Sliders,
  Book,
  Target,
  Plus,
  X,
  Bug,
  TrendingUp,
  UserPlus,
  Percent,
  Heart,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [tokenUsage, setTokenUsage] = useState([])
  const [dailyTokens, setDailyTokens] = useState([])
  const [users, setUsers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [blockModal, setBlockModal] = useState({ open: false, user: null })
  const [blockReason, setBlockReason] = useState('')
  
  // AI Settings state
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    matchLimit: 10,
    model: '',
    maxTokens: 250
  })
  const [savingAi, setSavingAi] = useState(false)
  
  // Profile Options state
  const [profileOptions, setProfileOptions] = useState({
    subjects: [],
    studyGoals: []
  })
  const [newSubject, setNewSubject] = useState('')
  const [newStudyGoal, setNewStudyGoal] = useState('')
  const [savingOptions, setSavingOptions] = useState(false)
  
  // Bug Reports state
  const [bugReports, setBugReports] = useState([])
  const [bugReportStats, setBugReportStats] = useState({})
  const [bugStatusFilter, setBugStatusFilter] = useState('')
  const [selectedBugReport, setSelectedBugReport] = useState(null)
  const [bugReportModal, setBugReportModal] = useState({ open: false, report: null })
  const [updatingBug, setUpdatingBug] = useState(false)
  
  // Engagement Analytics state
  const [engagementData, setEngagementData] = useState(null)
  const [loadingEngagement, setLoadingEngagement] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [
        statsRes,
        tokenRes,
        dailyTokenRes,
        usersRes,
        activityRes,
        aiSettingsRes,
        profileOptionsRes,
        bugReportsRes,
        bugStatsRes,
        engagementRes,
      ] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/token-usage'),
        api.get('/api/admin/token-usage/daily?days=14'),
        api.get('/api/admin/users'),
        api.get('/api/admin/recent-activity?limit=10'),
        api.get('/api/admin/ai-settings'),
        adminApi.getProfileOptions(),
        bugReportApi.getAll(),
        bugReportApi.getStats(),
        api.get('/api/admin/engagement-analytics?days=14'),
      ])

      setStats(statsRes.data)
      setAiSettings(aiSettingsRes.data)
      setTokenUsage(tokenRes.data)
      setDailyTokens(dailyTokenRes.data)
      setUsers(usersRes.data)
      setRecentActivity(activityRes.data)
      setProfileOptions(profileOptionsRes.data)
      setBugReports(bugReportsRes.data.content || [])
      setBugReportStats(bugStatsRes.data)
      setEngagementData(engagementRes.data)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const handleBlockUser = async () => {
    if (!blockModal.user) return
    try {
      await api.post(`/api/admin/users/${blockModal.user.id}/block`, {
        reason: blockReason || 'Blocked by admin',
      })
      setBlockModal({ open: false, user: null })
      setBlockReason('')
      loadAllData()
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const handleUnblockUser = async (userId) => {
    try {
      await api.post(`/api/admin/users/${userId}/unblock`)
      loadAllData()
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

  const handleToggleAI = async () => {
    setSavingAi(true)
    try {
      const res = await api.post('/api/admin/ai-settings/toggle', {
        enabled: !aiSettings.enabled
      })
      setAiSettings(prev => ({ ...prev, enabled: res.data.enabled }))
    } catch (error) {
      console.error('Failed to toggle AI:', error)
    } finally {
      setSavingAi(false)
    }
  }

  const handleUpdateMatchLimit = async (newLimit) => {
    setSavingAi(true)
    try {
      const res = await api.post('/api/admin/ai-settings/match-limit', {
        limit: newLimit
      })
      setAiSettings(prev => ({ ...prev, matchLimit: res.data.matchLimit }))
    } catch (error) {
      console.error('Failed to update match limit:', error)
    } finally {
      setSavingAi(false)
    }
  }

  // Profile Options handlers
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return
    setSavingOptions(true)
    try {
      const res = await adminApi.addSubject(newSubject.trim())
      setProfileOptions(prev => ({ ...prev, subjects: res.data }))
      setNewSubject('')
    } catch (error) {
      console.error('Failed to add subject:', error)
    } finally {
      setSavingOptions(false)
    }
  }

  const handleRemoveSubject = async (subject) => {
    setSavingOptions(true)
    try {
      const res = await adminApi.removeSubject(subject)
      setProfileOptions(prev => ({ ...prev, subjects: res.data }))
    } catch (error) {
      console.error('Failed to remove subject:', error)
    } finally {
      setSavingOptions(false)
    }
  }

  const handleAddStudyGoal = async () => {
    if (!newStudyGoal.trim()) return
    setSavingOptions(true)
    try {
      const res = await adminApi.addStudyGoal(newStudyGoal.trim())
      setProfileOptions(prev => ({ ...prev, studyGoals: res.data }))
      setNewStudyGoal('')
    } catch (error) {
      console.error('Failed to add study goal:', error)
    } finally {
      setSavingOptions(false)
    }
  }

  const handleRemoveStudyGoal = async (goal) => {
    setSavingOptions(true)
    try {
      const res = await adminApi.removeStudyGoal(goal)
      setProfileOptions(prev => ({ ...prev, studyGoals: res.data }))
    } catch (error) {
      console.error('Failed to remove study goal:', error)
    } finally {
      setSavingOptions(false)
    }
  }

  // Bug Report handlers
  const loadBugReports = async (status = '') => {
    try {
      const res = await bugReportApi.getAll(0, status || null)
      setBugReports(res.data.content || [])
    } catch (error) {
      console.error('Failed to load bug reports:', error)
    }
  }

  const handleUpdateBugReport = async (id, updates) => {
    setUpdatingBug(true)
    try {
      const res = await bugReportApi.update(id, updates)
      setBugReports(prev => prev.map(b => b.id === id ? res.data : b))
      setBugReportModal({ open: false, report: null })
      // Reload stats
      const statsRes = await bugReportApi.getStats()
      setBugReportStats(statsRes.data)
    } catch (error) {
      console.error('Failed to update bug report:', error)
    } finally {
      setUpdatingBug(false)
    }
  }

  const handleFilterBugReports = async (status) => {
    setBugStatusFilter(status)
    await loadBugReports(status)
  }

  const getBugStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'CLOSED': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
      case 'WONT_FIX': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const getBugPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white'
      case 'HIGH': return 'bg-orange-500 text-white'
      case 'MEDIUM': return 'bg-yellow-500 text-white'
      case 'LOW': return 'bg-green-500 text-white'
      default: return 'bg-slate-500 text-white'
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor platform activity and manage users
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {['overview', 'users', 'bug-reports', 'ai-usage', 'ai-settings', 'profile-options'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
              subValue={`${stats.newUsersThisWeek || 0} new this week`}
              color="blue"
            />
            <StatCard
              icon={MessageCircle}
              label="Total Messages"
              value={stats.totalMessages?.toLocaleString()}
              subValue={`${stats.avgMessagesPerUser || 0} avg/user`}
              color="green"
            />
            <StatCard
              icon={Calendar}
              label="Study Sessions"
              value={stats.totalSessions}
              subValue={`${stats.onlineNow} online now`}
              color="purple"
            />
            <StatCard
              icon={Zap}
              label="AI Tokens Used"
              value={stats.totalTokensUsed?.toLocaleString() || '0'}
              subValue={`${stats.tokensThisWeek?.toLocaleString() || 0} this week`}
              color="amber"
            />
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-500">DAU</span>
              </div>
              <p className="text-2xl font-bold">{stats.dau || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Daily Active Users</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-500">WAU</span>
              </div>
              <p className="text-2xl font-bold">{stats.wau || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Weekly Active Users</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-500">DAU/WAU</span>
              </div>
              <p className="text-2xl font-bold">{stats.dauWauRatio || 0}%</p>
              <p className="text-xs text-slate-400 mt-1">Stickiness Ratio</p>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-slate-500">Match Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.matchSuccessRate || 0}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.mutualMatches || 0} mutual</p>
            </div>
          </div>

          {/* Engagement Charts Row */}
          {engagementData && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* DAU Trend Chart */}
              <div className="card p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                  Daily Active Users (14 days)
                </h3>
                {engagementData.dauTrend?.length > 0 ? (
                  <div className="h-48 md:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData.dauTrend}>
                        <defs>
                          <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="activeUsers"
                          stroke="#10b981"
                          fill="url(#dauGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    No data available
                  </div>
                )}
              </div>

              {/* New Registrations Chart */}
              <div className="card p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  New Registrations (14 days)
                </h3>
                {engagementData.registrationTrend?.length > 0 ? (
                  <div className="h-48 md:h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData.registrationTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="newUsers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                    No data available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Retention & Profile Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4 border-l-4 border-emerald-500">
              <p className="text-sm text-slate-500 mb-1">Weekly Retention</p>
              <p className="text-xl md:text-2xl font-bold text-emerald-600">
                {engagementData?.weeklyRetentionRate || 0}%
              </p>
              <p className="text-xs text-slate-400">
                {engagementData?.retainedUsers || 0} of {engagementData?.cohortSize || 0} users
              </p>
            </div>
            <div className="card p-4 border-l-4 border-blue-500">
              <p className="text-sm text-slate-500 mb-1">Profile Completion</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {stats.profileCompletionRate || 0}%
              </p>
              <p className="text-xs text-slate-400">Users with complete profiles</p>
            </div>
            <div className="card p-4 border-l-4 border-violet-500 col-span-2 md:col-span-1">
              <p className="text-sm text-slate-500 mb-1">MAU</p>
              <p className="text-xl md:text-2xl font-bold text-violet-600">{stats.mau || 0}</p>
              <p className="text-xs text-slate-400">Monthly Active Users</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-4 md:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 md:p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === 'registration'
                        ? 'bg-green-500'
                        : activity.type === 'match'
                        ? 'bg-pink-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <p className="flex-1 text-xs md:text-sm truncate">{activity.description}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-slate-500 text-center py-4 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management ({users.length} users)
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">User</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Streak</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                          {u.displayName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.displayName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.blocked ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Blocked
                        </span>
                      ) : u.isOnline ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Online
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{u.studyStreak || 0} days</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <>
                          {u.blocked ? (
                            <button
                              onClick={() => handleUnblockUser(u.id)}
                              className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 transition-colors"
                              title="Unblock user"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setBlockModal({ open: true, user: u })}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                              title="Block user"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bug-reports' && (
        <div className="space-y-6">
          {/* Bug Report Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold">{bugReportStats.total || 0}</p>
              <p className="text-sm text-slate-500">Total Reports</p>
            </div>
            <div className="card p-4 text-center border-l-4 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-600">{bugReportStats.open || 0}</p>
              <p className="text-sm text-slate-500">Open</p>
            </div>
            <div className="card p-4 text-center border-l-4 border-blue-500">
              <p className="text-2xl font-bold text-blue-600">{bugReportStats.inProgress || 0}</p>
              <p className="text-sm text-slate-500">In Progress</p>
            </div>
            <div className="card p-4 text-center border-l-4 border-green-500">
              <p className="text-2xl font-bold text-green-600">{bugReportStats.resolved || 0}</p>
              <p className="text-sm text-slate-500">Resolved</p>
            </div>
            <div className="card p-4 text-center border-l-4 border-slate-500">
              <p className="text-2xl font-bold text-slate-600">{bugReportStats.closed || 0}</p>
              <p className="text-sm text-slate-500">Closed</p>
            </div>
          </div>

          {/* Bug Reports List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Bug Reports
              </h3>
              <div className="flex gap-2">
                <select
                  value={bugStatusFilter}
                  onChange={(e) => handleFilterBugReports(e.target.value)}
                  className="input py-2 px-3"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="WONT_FIX">Won't Fix</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {bugReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => setBugReportModal({ open: true, report })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBugPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBugStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                          {report.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-medium truncate">{report.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {report.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{report.reporterName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {bugReports.length === 0 && (
                <div className="text-center py-12">
                  <Bug className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No bug reports yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-usage' && (
        <>
          {dailyTokens.length === 0 && tokenUsage.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No AI Usage Data Yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                AI token usage will appear here once users start getting AI-powered match recommendations.
                Make sure AI matching is enabled in the AI Settings tab.
              </p>
            </div>
          ) : (
            <>
              {/* Token Usage Chart */}
              <div className="card p-6 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-500" />
                  Daily AI Token Usage (Last 14 Days)
                </h3>
                {dailyTokens.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyTokens}>
                        <defs>
                          <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="tokens"
                          stroke="#8b5cf6"
                          fill="url(#tokenGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <p>No daily usage data available</p>
                  </div>
                )}
              </div>

              {/* Token Usage by User */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Token Usage by User
                </h3>
                {tokenUsage.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tokenUsage.slice(0, 5)}
                            dataKey="totalTokens"
                            nameKey="displayName"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => entry.displayName?.split(' ')[0]}
                          >
                            {tokenUsage.slice(0, 5).map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {tokenUsage.map((user, i) => (
                        <div
                          key={user.userId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.displayName}</p>
                          </div>
                          <p className="font-mono text-sm">
                            {user.totalTokens?.toLocaleString()} tokens
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-500">
                    <p>No user token usage data available</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'ai-settings' && (
        <div className="space-y-6">
          {/* AI Toggle Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  aiSettings.enabled 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Matching</h3>
                  <p className="text-sm text-slate-500">
                    {aiSettings.enabled 
                      ? 'AI is analyzing matches for better recommendations' 
                      : 'AI is disabled, using rule-based matching only'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAI}
                disabled={savingAi}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  aiSettings.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  aiSettings.enabled ? 'translate-x-9' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Match Limit Card */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary-500" />
              AI Match Analysis Limit
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Number of top matches to analyze with AI. Lower = less token usage, higher = more accurate rankings.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={aiSettings.matchLimit}
                onChange={(e) => setAiSettings(prev => ({ ...prev, matchLimit: parseInt(e.target.value) }))}
                onMouseUp={(e) => handleUpdateMatchLimit(parseInt(e.target.value))}
                onTouchEnd={(e) => handleUpdateMatchLimit(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="w-20 text-center">
                <span className="text-2xl font-bold text-primary-500">{aiSettings.matchLimit}</span>
                <p className="text-xs text-slate-500">matches</p>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Min tokens</span>
              <span>Max accuracy</span>
            </div>
          </div>

          {/* Token Estimation Card */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Estimated Token Usage
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Per Match</p>
                <p className="text-xl font-bold">~400 tokens</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Per User (limit: {aiSettings.matchLimit})</p>
                <p className="text-xl font-bold">~{(aiSettings.matchLimit * 400).toLocaleString()} tokens</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Groq Free Tier</p>
                <p className="text-xl font-bold">~500k/day</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Est. Users/Day</p>
                <p className="text-xl font-bold text-green-500">
                  ~{Math.floor(500000 / (aiSettings.matchLimit * 400)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Current Config Card */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              Current Configuration
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Model</span>
                <span className="font-mono text-sm">{aiSettings.model || 'llama-3.3-70b-versatile'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Max Tokens (Response)</span>
                <span className="font-mono text-sm">{aiSettings.maxTokens}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">AI Status</span>
                <span className={`font-medium ${aiSettings.enabled ? 'text-green-500' : 'text-red-500'}`}>
                  {aiSettings.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Cache TTL</span>
                <span className="font-mono text-sm">24 hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile-options' && (
        <div className="space-y-6">
          {/* Subjects Management */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Subjects</h3>
                  <p className="text-sm text-slate-500">
                    Manage subjects that users can select for their profile
                  </p>
                </div>
              </div>
              <span className="text-sm text-slate-500">
                {profileOptions.subjects?.length || 0} items
              </span>
            </div>

            {/* Add new subject */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Add new subject..."
                className="input flex-1"
                disabled={savingOptions}
              />
              <button
                onClick={handleAddSubject}
                disabled={savingOptions || !newSubject.trim()}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Subjects list */}
            <div className="flex flex-wrap gap-2">
              {profileOptions.subjects?.map((subject) => (
                <div
                  key={subject}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  <span className="font-medium">{subject}</span>
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    disabled={savingOptions}
                    className="hover:text-red-500 transition-colors"
                    title="Remove subject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!profileOptions.subjects || profileOptions.subjects.length === 0) && (
                <p className="text-slate-500 text-center py-4 w-full">
                  No subjects added yet
                </p>
              )}
            </div>
          </div>

          {/* Study Goals Management */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Study Goals</h3>
                  <p className="text-sm text-slate-500">
                    Manage study goals / exam types that users can select
                  </p>
                </div>
              </div>
              <span className="text-sm text-slate-500">
                {profileOptions.studyGoals?.length || 0} items
              </span>
            </div>

            {/* Add new study goal */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newStudyGoal}
                onChange={(e) => setNewStudyGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStudyGoal()}
                placeholder="Add new study goal..."
                className="input flex-1"
                disabled={savingOptions}
              />
              <button
                onClick={handleAddStudyGoal}
                disabled={savingOptions || !newStudyGoal.trim()}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Study goals list */}
            <div className="flex flex-wrap gap-2">
              {profileOptions.studyGoals?.map((goal) => (
                <div
                  key={goal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  <span className="font-medium">{goal}</span>
                  <button
                    onClick={() => handleRemoveStudyGoal(goal)}
                    disabled={savingOptions}
                    className="hover:text-red-500 transition-colors"
                    title="Remove study goal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!profileOptions.studyGoals || profileOptions.studyGoals.length === 0) && (
                <p className="text-slate-500 text-center py-4 w-full">
                  No study goals added yet
                </p>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="card p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                Changes are saved immediately and reflected in user profile setup
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                Users can also add custom subjects not in this list
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500">•</span>
                Removing an option won't affect users who already selected it
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Bug Report Detail Modal */}
      {bugReportModal.open && bugReportModal.report && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBugPriorityColor(bugReportModal.report.priority)}`}>
                    {bugReportModal.report.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBugStatusColor(bugReportModal.report.status)}`}>
                    {bugReportModal.report.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{bugReportModal.report.title}</h3>
              </div>
              <button
                onClick={() => setBugReportModal({ open: false, report: null })}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Reporter Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                  {bugReportModal.report.reporterName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{bugReportModal.report.reporterName}</p>
                  <p className="text-xs text-slate-500">{bugReportModal.report.reporterEmail}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-slate-500">Reported</p>
                  <p className="text-sm">{new Date(bugReportModal.report.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1 block">Description</label>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700 whitespace-pre-wrap">
                  {bugReportModal.report.description}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-1 block">Category</label>
                  <p className="text-sm">{bugReportModal.report.category.replace('_', ' ')}</p>
                </div>
                {bugReportModal.report.pageUrl && (
                  <div>
                    <label className="text-sm font-medium text-slate-500 mb-1 block">Page URL</label>
                    <p className="text-sm font-mono truncate">{bugReportModal.report.pageUrl}</p>
                  </div>
                )}
                {bugReportModal.report.browserInfo && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-500 mb-1 block">Browser Info</label>
                    <p className="text-xs font-mono text-slate-500">{bugReportModal.report.browserInfo}</p>
                  </div>
                )}
              </div>

              <hr className="border-slate-200 dark:border-slate-700" />

              {/* Update Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-1 block">Status</label>
                  <select
                    value={bugReportModal.report.status}
                    onChange={(e) => setBugReportModal(prev => ({
                      ...prev,
                      report: { ...prev.report, status: e.target.value }
                    }))}
                    className="input w-full"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                    <option value="WONT_FIX">Won't Fix</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-1 block">Priority</label>
                  <select
                    value={bugReportModal.report.priority}
                    onChange={(e) => setBugReportModal(prev => ({
                      ...prev,
                      report: { ...prev.report, priority: e.target.value }
                    }))}
                    className="input w-full"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 mb-1 block">Admin Notes</label>
                <textarea
                  value={bugReportModal.report.adminNotes || ''}
                  onChange={(e) => setBugReportModal(prev => ({
                    ...prev,
                    report: { ...prev.report, adminNotes: e.target.value }
                  }))}
                  placeholder="Add internal notes about this bug report..."
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setBugReportModal({ open: false, report: null })}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateBugReport(bugReportModal.report.id, {
                    status: bugReportModal.report.status,
                    priority: bugReportModal.report.priority,
                    adminNotes: bugReportModal.report.adminNotes
                  })}
                  disabled={updatingBug}
                  className="btn-primary"
                >
                  {updatingBug ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-red-500" />
              Block User
            </h3>
            <p className="text-slate-500 mb-4">
              Are you sure you want to block{' '}
              <strong>{blockModal.user?.displayName}</strong>? They won't be able
              to log in.
            </p>
            <input
              type="text"
              placeholder="Reason for blocking (optional)"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="input w-full mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBlockModal({ open: false, user: null })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="btn-primary bg-red-500 hover:bg-red-600"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subValue, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  }

  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-bl-full`}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value || 0}</p>
          {subValue && (
            <p className="text-xs text-slate-400 mt-1">{subValue}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

