import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { leaderboardApi } from '../services/api'
import {
  Trophy,
  Flame,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  Crown,
  Medal,
  Award,
  Star,
  Zap,
  Target,
} from 'lucide-react'

const LeaderboardCard = ({ title, icon: Icon, iconGradient, entries, emptyMessage, currentUserId }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-500">#{rank}</span>
  }

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700'
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border-slate-200 dark:border-slate-600'
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700'
    return 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  }

  return (
    <div className="card overflow-hidden">
      <div className={`p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r ${iconGradient}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-display font-semibold text-white">{title}</h3>
        </div>
      </div>
      
      <div className="p-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Link
                key={entry.userId}
                to={`/profile/${entry.userId}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${getRankBg(entry.rank)} ${
                  entry.userId === currentUserId ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="avatar w-10 h-10 text-sm flex-shrink-0">
                  {getInitials(entry.displayName)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {entry.displayName}
                    {entry.userId === currentUserId && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  {entry.subjects && entry.subjects.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {entry.subjects.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <p className={`font-bold ${entry.rank <= 3 ? 'text-lg' : 'text-base'} ${
                    entry.rank === 1 ? 'text-amber-500' : 
                    entry.rank === 2 ? 'text-slate-500' : 
                    entry.rank === 3 ? 'text-amber-600' : 
                    'text-primary-500'
                  }`}>
                    {entry.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardApi.getLeaderboard()
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    {
      key: 'topStreaks',
      title: 'Top Streaks',
      icon: Flame,
      iconGradient: 'from-orange-500 to-red-500',
      emptyMessage: 'No streaks yet. Start studying daily!',
    },
    {
      key: 'topStudyHours',
      title: 'Top Study Hours',
      icon: Clock,
      iconGradient: 'from-primary-500 to-primary-600',
      emptyMessage: 'No study hours logged this week.',
    },
    {
      key: 'mostDaysActive',
      title: 'Most Days Active',
      icon: Calendar,
      iconGradient: 'from-emerald-500 to-teal-500',
      emptyMessage: 'No activity data yet.',
    },
    {
      key: 'mostSessionsCompleted',
      title: 'Sessions Completed',
      icon: BookOpen,
      iconGradient: 'from-purple-500 to-violet-500',
      emptyMessage: 'No sessions completed yet.',
    },
    {
      key: 'mostStudyPartners',
      title: 'Most Study Partners',
      icon: Users,
      iconGradient: 'from-pink-500 to-rose-500',
      emptyMessage: 'No study partners yet.',
    },
    {
      key: 'risingStars',
      title: 'Rising Stars',
      icon: TrendingUp,
      iconGradient: 'from-cyan-500 to-blue-500',
      emptyMessage: 'No rising stars this week.',
    },
  ]

  const tabs = [
    { key: 'all', label: 'All', icon: Trophy },
    { key: 'topStreaks', label: 'Streaks', icon: Flame },
    { key: 'topStudyHours', label: 'Hours', icon: Clock },
    { key: 'risingStars', label: 'Rising', icon: TrendingUp },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-500">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const filteredCategories = activeTab === 'all' 
    ? categories 
    : categories.filter(c => c.key === activeTab)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
          <span className="text-gradient">Leaderboard</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          See how you stack up against other learners. Keep pushing to climb the ranks!
        </p>
      </div>

      {/* Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Stay Motivated!</h2>
              <p className="text-white/80 text-sm">Consistency is key. Study a little every day to build your streak.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Star className="w-6 h-6 text-yellow-300" />
                {leaderboard?.topStreaks?.[0]?.value || 0}
              </div>
              <p className="text-xs text-white/70">Top Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Target className="w-6 h-6 text-emerald-300" />
                {leaderboard?.topStudyHours?.[0]?.value ? Math.round(leaderboard.topStudyHours[0].value / 60) : 0}h
              </div>
              <p className="text-xs text-white/70">Top Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Grid */}
      <div className={`grid gap-6 ${activeTab === 'all' ? 'md:grid-cols-2 xl:grid-cols-3' : 'max-w-2xl mx-auto'}`}>
        {filteredCategories.map((category) => (
          <LeaderboardCard
            key={category.key}
            title={category.title}
            icon={category.icon}
            iconGradient={category.iconGradient}
            entries={leaderboard?.[category.key] || []}
            emptyMessage={category.emptyMessage}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* Tips Section */}
      <div className="card p-6 mt-8">
        <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Tips to Climb the Leaderboard
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Build Your Streak</p>
              <p className="text-sm text-slate-500">Log activity every day, even if it's just 15 minutes!</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-500 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Find Partners</p>
              <p className="text-sm text-slate-500">Connect with more study buddies to stay accountable.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Schedule Sessions</p>
              <p className="text-sm text-slate-500">Regular study sessions keep you on track.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

