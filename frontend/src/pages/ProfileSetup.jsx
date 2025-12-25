import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi } from '../services/api'
import {
  ArrowRight,
  ArrowLeft,
  Book,
  Clock,
  Brain,
  Target,
  Check,
  Plus,
  X,
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Subjects', icon: Book },
  { id: 2, title: 'Goals', icon: Target },
  { id: 3, title: 'Schedule', icon: Clock },
  { id: 4, title: 'Learning Style', icon: Brain },
]

// Fallback options in case API fails
const DEFAULT_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Economics', 'History', 'Literature', 'Psychology', 'Engineering',
  'Medicine', 'Law', 'Business', 'Art & Design', 'Languages',
]

const DEFAULT_EXAM_GOALS = [
  'GRE', 'GMAT', 'MCAT', 'LSAT', 'SAT', 'ACT', 'IELTS', 'TOEFL',
  'CPA', 'CFA', 'University Exams', 'Competitive Exams', 'Certifications', 'Other',
]

const TIME_SLOTS = [
  { id: 'early_morning', label: 'Early Morning (5-8 AM)' },
  { id: 'morning', label: 'Morning (8-12 PM)' },
  { id: 'afternoon', label: 'Afternoon (12-5 PM)' },
  { id: 'evening', label: 'Evening (5-9 PM)' },
  { id: 'night', label: 'Night (9 PM-12 AM)' },
  { id: 'late_night', label: 'Late Night (12-5 AM)' },
]

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', desc: 'Learn best with diagrams, charts, and videos' },
  { id: 'reading', label: 'Reading/Writing', desc: 'Prefer notes, articles, and textbooks' },
  { id: 'auditory', label: 'Auditory', desc: 'Learn through discussions and lectures' },
  { id: 'kinesthetic', label: 'Hands-on', desc: 'Practice problems and experiments' },
  { id: 'collaborative', label: 'Collaborative', desc: 'Study groups and peer teaching' },
  { id: 'solo', label: 'Solo', desc: 'Self-paced independent study' },
]

export default function ProfileSetup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    subjects: [],
    examGoal: '',
    customGoal: '',
    preferredTimes: [],
    learningStyles: [],
    bio: '',
    strengths: [],
    weaknesses: [],
  })
  const [customSubject, setCustomSubject] = useState('')
  const [profileOptions, setProfileOptions] = useState({
    subjects: DEFAULT_SUBJECTS,
    studyGoals: DEFAULT_EXAM_GOALS,
  })
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  useEffect(() => {
    loadProfileOptions()
  }, [])

  const loadProfileOptions = async () => {
    try {
      const response = await profileApi.getOptions()
      setProfileOptions({
        subjects: response.data.subjects || DEFAULT_SUBJECTS,
        studyGoals: response.data.studyGoals || DEFAULT_EXAM_GOALS,
      })
    } catch (error) {
      console.error('Failed to load profile options:', error)
      // Keep using defaults
    }
  }

  const toggleItem = (array, item) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item)
    }
    return [...array, item]
  }

  const updateProfile = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const addCustomSubject = () => {
    if (customSubject.trim() && !profile.subjects.includes(customSubject.trim())) {
      updateProfile('subjects', [...profile.subjects, customSubject.trim()])
      setCustomSubject('')
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await profileApi.updateMe({
        subjects: profile.subjects,
        examGoal: profile.examGoal === 'Other' ? profile.customGoal : profile.examGoal,
        preferredTimes: profile.preferredTimes,
        learningStyle: profile.learningStyles[0] || 'visual',
        bio: profile.bio,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
      })
      updateUser({ profileComplete: true })
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.subjects.length > 0
      case 2:
        return profile.examGoal && (profile.examGoal !== 'Other' || profile.customGoal)
      case 3:
        return profile.preferredTimes.length > 0
      case 4:
        return profile.learningStyles.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step > s.id
                      ? 'bg-primary-500 text-white'
                      : step === s.id
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-2 rounded-full transition-colors ${
                      step > s.id ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500">
            Step {step} of {STEPS.length}: {STEPS[step - 1].title}
          </p>
        </div>

        <div className="card p-6 md:p-8 animate-fade-in">
          {/* Step 1: Subjects */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">What do you study?</h2>
                <p className="text-slate-500">Select all subjects you're interested in</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {profileOptions.subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => updateProfile('subjects', toggleItem(profile.subjects, subject))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      profile.subjects.includes(subject)
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                  placeholder="Add custom subject..."
                  className="input flex-1"
                />
                <button onClick={addCustomSubject} className="btn-secondary">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {profile.subjects.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                    Selected ({profile.subjects.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 text-sm"
                      >
                        {subject}
                        <button
                          onClick={() => updateProfile('subjects', profile.subjects.filter((s) => s !== subject))}
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
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">What's your goal?</h2>
                <p className="text-slate-500">Select your primary exam or study goal</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profileOptions.studyGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => updateProfile('examGoal', goal)}
                    className={`p-4 rounded-xl text-center font-medium transition-all ${
                      profile.examGoal === goal
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {profile.examGoal === 'Other' && (
                <input
                  type="text"
                  value={profile.customGoal}
                  onChange={(e) => updateProfile('customGoal', e.target.value)}
                  placeholder="Enter your goal..."
                  className="input"
                />
              )}

              <div>
                <label className="label">Short bio (optional)</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  placeholder="Tell potential study partners about yourself..."
                  className="input min-h-[100px] resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {profile.bio.length}/300
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">When do you study?</h2>
                <p className="text-slate-500">Select your preferred study times</p>
              </div>

              <div className="space-y-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => updateProfile('preferredTimes', toggleItem(profile.preferredTimes, slot.id))}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                      profile.preferredTimes.includes(slot.id)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>{slot.label}</span>
                    {profile.preferredTimes.includes(slot.id) && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Learning Style */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold mb-2">How do you learn best?</h2>
                <p className="text-slate-500">Select up to 2 learning styles</p>
              </div>

              <div className="grid gap-3">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      if (profile.learningStyles.includes(style.id)) {
                        updateProfile('learningStyles', profile.learningStyles.filter((s) => s !== style.id))
                      } else if (profile.learningStyles.length < 2) {
                        updateProfile('learningStyles', [...profile.learningStyles, style.id])
                      }
                    }}
                    className={`p-4 rounded-xl text-left transition-all ${
                      profile.learningStyles.includes(style.id)
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{style.label}</span>
                      {profile.learningStyles.includes(style.id) && <Check className="w-5 h-5" />}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        profile.learningStyles.includes(style.id)
                          ? 'text-white/80'
                          : 'text-slate-500'
                      }`}
                    >
                      {style.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-secondary">
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="btn-primary"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

