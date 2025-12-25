import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileApi, userApi, badgeApi } from '../services/api'
import {
  User,
  Mail,
  Book,
  Target,
  Clock,
  Brain,
  Edit2,
  Save,
  X,
  Plus,
  Check,
  AtSign,
  Copy,
  CheckCircle,
  Trophy,
  Flame,
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

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [badges, setBadges] = useState({ earnedBadges: [], totalEarned: 0, totalAvailable: 0 })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({})
  const [newSubject, setNewSubject] = useState('')
  const [copied, setCopied] = useState(false)
  const [profileOptions, setProfileOptions] = useState({
    subjects: [],
    studyGoals: [],
  })

  const copyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(`@${user.username}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    loadProfile()
    loadProfileOptions()
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      const response = await badgeApi.getBadges()
      setBadges(response.data)
    } catch (error) {
      console.error('Failed to load badges:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const response = await profileApi.getMe()
      setProfile(response.data)
      setEditData(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfileOptions = async () => {
    try {
      const response = await profileApi.getOptions()
      setProfileOptions(response.data)
    } catch (error) {
      console.error('Failed to load profile options:', error)
    }
  }

  const toggleSubject = (subject) => {
    const subjects = editData.subjects || []
    if (subjects.includes(subject)) {
      setEditData({
        ...editData,
        subjects: subjects.filter((s) => s !== subject),
      })
    } else {
      setEditData({
        ...editData,
        subjects: [...subjects, subject],
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await profileApi.updateMe(editData)
      setProfile(editData)
      setEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addSubject = () => {
    if (newSubject.trim() && !editData.subjects?.includes(newSubject.trim())) {
      setEditData({
        ...editData,
        subjects: [...(editData.subjects || []), newSubject.trim()],
      })
      setNewSubject('')
    }
  }

  const removeSubject = (subject) => {
    setEditData({
      ...editData,
      subjects: editData.subjects.filter((s) => s !== subject),
    })
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="avatar w-24 h-24 text-3xl">
            {getInitials(user?.displayName)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold">{user?.displayName}</h1>
            {user?.username && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">@{user.username}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• Unique ID</span>
              </div>
            )}
            <p className="text-slate-500 flex items-center gap-2 mt-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
            {profile?.bio && (
              <p className="mt-3 text-slate-600 dark:text-slate-300">{profile.bio}</p>
            )}
          </div>

          <button
            onClick={() => {
              if (editing) {
                setEditData(profile)
              }
              setEditing(!editing)
            }}
            className={editing ? 'btn-secondary' : 'btn-primary'}
          >
            {editing ? (
              <>
                <X className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Username Card - Special Identifier */}
      {user?.username && (
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <AtSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Your Unique Username</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={copyUsername}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Share this username with others so they can find and connect with you.
          </p>
        </div>
      )}

      {/* Badges & Stats */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-semibold text-lg">Badges & Stats</h2>
          </div>
          <span className="text-sm text-slate-500">{badges.totalEarned} / {badges.totalAvailable} earned</span>
        </div>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold">{profile?.studyStreak || 0}</p>
              <p className="text-xs text-slate-500">Day Streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold">{badges.totalEarned}</p>
              <p className="text-xs text-slate-500">Badges</p>
            </div>
          </div>
        </div>

        {badges.earnedBadges && badges.earnedBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {badges.earnedBadges.slice(0, 8).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700"
                title={badge.description}
              >
                <span className="text-xl">{badge.emoji}</span>
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
            {badges.earnedBadges.length > 8 && (
              <div className="flex items-center px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 text-sm">
                +{badges.earnedBadges.length - 8} more
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No badges earned yet. Start studying to earn badges!</p>
        )}
      </div>

      {/* Subjects */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Book className="w-5 h-5 text-primary-500" />
          <h2 className="font-display font-semibold text-lg">Subjects</h2>
        </div>

        {editing ? (
          <div className="space-y-4">
            {/* Subject options from server */}
            <div className="flex flex-wrap gap-2">
              {profileOptions.subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    editData.subjects?.includes(subject)
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            
            {/* Custom subject input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                placeholder="Add custom subject..."
                className="input flex-1"
              />
              <button onClick={addSubject} className="btn-secondary">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Selected subjects summary */}
            {editData.subjects?.length > 0 && (
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Selected ({editData.subjects.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {editData.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 text-sm"
                    >
                      {subject}
                      <button
                        onClick={() => removeSubject(subject)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.subjects?.map((subject) => (
              <span key={subject} className="badge-primary">
                {subject}
              </span>
            )) || <p className="text-slate-500">No subjects added</p>}
          </div>
        )}
      </div>

      {/* Study Goal */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent-500" />
          <h2 className="font-display font-semibold text-lg">Study Goal</h2>
        </div>

        {editing ? (
          <div className="space-y-4">
            {/* Study goal options from server */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profileOptions.studyGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setEditData({ ...editData, examGoal: goal })}
                  className={`p-4 rounded-xl text-center font-medium transition-all ${
                    editData.examGoal === goal
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            
            {/* Custom goal input when "Other" is selected */}
            {editData.examGoal === 'Other' && (
              <input
                type="text"
                value={editData.customGoal || ''}
                onChange={(e) => setEditData({ ...editData, customGoal: e.target.value })}
                placeholder="Enter your custom goal..."
                className="input"
              />
            )}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">
            {profile?.examGoal || 'No goal set'}
          </p>
        )}
      </div>

      {/* Preferred Times */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h2 className="font-display font-semibold text-lg">Preferred Study Times</h2>
        </div>

        {editing ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(TIME_SLOTS).map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  const times = editData.preferredTimes || []
                  if (times.includes(id)) {
                    setEditData({
                      ...editData,
                      preferredTimes: times.filter((t) => t !== id),
                    })
                  } else {
                    setEditData({
                      ...editData,
                      preferredTimes: [...times, id],
                    })
                  }
                }}
                className={`p-3 rounded-xl text-sm text-left transition-all ${
                  editData.preferredTimes?.includes(id)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.preferredTimes?.map((time) => (
              <span key={time} className="badge-success">
                {TIME_SLOTS[time] || time}
              </span>
            )) || <p className="text-slate-500">No preferred times set</p>}
          </div>
        )}
      </div>

      {/* Learning Style */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-amber-500" />
          <h2 className="font-display font-semibold text-lg">Learning Style</h2>
        </div>

        {editing ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(LEARNING_STYLES).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setEditData({ ...editData, learningStyle: id })}
                className={`p-3 rounded-xl text-sm text-left transition-all flex items-center justify-between ${
                  editData.learningStyle === id
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {label}
                {editData.learningStyle === id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        ) : (
          <span className="badge-accent">
            {LEARNING_STYLES[profile?.learningStyle] || 'Not set'}
          </span>
        )}
      </div>

      {/* Bio */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          <h2 className="font-display font-semibold text-lg">Bio</h2>
        </div>

        {editing ? (
          <textarea
            value={editData.bio || ''}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            placeholder="Tell others about yourself..."
            className="input min-h-[120px] resize-none"
            maxLength={300}
          />
        ) : (
          <p className="text-slate-600 dark:text-slate-300">
            {profile?.bio || 'No bio added'}
          </p>
        )}
      </div>

      {/* Save Button */}
      {editing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

