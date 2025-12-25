import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { profileApi } from '../services/api'
import {
  User,
  Mail,
  Book,
  Target,
  Clock,
  Brain,
  ArrowLeft,
  MessageCircle,
  AtSign,
} from 'lucide-react'

const TIME_SLOTS = {
  early_morning: 'Early Morning (5-8 AM)',
  morning: 'Morning (8-12 PM)',
  afternoon: 'Afternoon (12-5 PM)',
  evening: 'Evening (5-9 PM)',
  night: 'Night (9 PM-12 AM)',
  late_night: 'Late Night (12-5 AM)',
}

const LEARNING_STYLES = {
  visual: 'Visual Learner',
  reading: 'Reading/Writing',
  auditory: 'Auditory',
  kinesthetic: 'Hands-on',
  collaborative: 'Collaborative',
  solo: 'Solo Study',
}

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await profileApi.getById(userId)
      setProfile(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setError('Unable to load this profile')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Go Back
      </button>

      {/* Header Card */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="avatar w-24 h-24 text-3xl">
            {getInitials(profile?.displayName)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">{profile?.displayName}</h1>
            {profile?.username && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800">
                <AtSign className="w-4 h-4 text-primary-500" />
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">{profile.username}</span>
              </div>
            )}
            {profile?.email && (
              <p className="text-slate-500 flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
            )}
            {profile?.bio && (
              <p className="mt-3 text-slate-600 dark:text-slate-300">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subjects */}
      {profile?.subjects?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Book className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-semibold text-lg">Subjects</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((subject) => (
              <span key={subject} className="badge-primary">
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Study Goal */}
      {profile?.examGoal && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-accent-500" />
            <h2 className="font-display font-semibold text-lg">Study Goal</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">{profile.examGoal}</p>
        </div>
      )}

      {/* Preferred Times */}
      {profile?.preferredTimes?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h2 className="font-display font-semibold text-lg">Preferred Study Times</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.preferredTimes.map((time) => (
              <span key={time} className="badge-success">
                {TIME_SLOTS[time] || time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Style */}
      {profile?.learningStyle && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-semibold text-lg">Learning Style</h2>
          </div>
          <span className="badge-accent">
            {LEARNING_STYLES[profile.learningStyle] || profile.learningStyle}
          </span>
        </div>
      )}

      {/* Bio (if not shown in header) */}
      {profile?.bio && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-semibold text-lg">About</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-300">{profile.bio}</p>
        </div>
      )}
    </div>
  )
}

