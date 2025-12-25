import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileApi, API_URL } from '../services/api'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Copy, CheckCircle, AlertTriangle, Brain, Target, X, Plus } from 'lucide-react'

// OAuth URL - uses API_URL in production, localhost in development
const GOOGLE_OAUTH_URL = `${API_URL}/oauth2/authorization/google`

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

const TOTAL_STEPS = 5

export default function Register() {
  const [step, setStep] = useState(1) // 1: Account, 2: Subjects, 3: Goals, 4: Schedule, 5: Learning Style + Bio
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [profileData, setProfileData] = useState({
    subjects: [],
    preferredTimes: [],
    examGoal: '',
    customGoal: '',
    learningStyle: '',
    bio: '',
  })
  const [customSubject, setCustomSubject] = useState('')
  const [profileOptions, setProfileOptions] = useState({
    subjects: DEFAULT_SUBJECTS,
    studyGoals: DEFAULT_EXAM_GOALS,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [registeredUsername, setRegisteredUsername] = useState('')
  const [registeredUserData, setRegisteredUserData] = useState(null)
  const [copied, setCopied] = useState(false)
  const { register, setUserAfterRegister } = useAuth()
  const navigate = useNavigate()

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

  const updateProfileData = (key, value) => {
    setProfileData((prev) => ({ ...prev, [key]: value }))
  }

  const addCustomSubject = () => {
    if (customSubject.trim() && !profileData.subjects.includes(customSubject.trim())) {
      updateProfileData('subjects', [...profileData.subjects, customSubject.trim()])
      setCustomSubject('')
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const passwordStrength = () => {
    const { password } = formData
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strengthColors = ['bg-danger-500', 'bg-warning-500', 'bg-amber-500', 'bg-success-500']
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return formData.displayName && formData.email && formData.password && 
               formData.password === formData.confirmPassword && formData.password.length >= 8
      case 2:
        return profileData.subjects.length > 0
      case 3:
        return profileData.examGoal && (profileData.examGoal !== 'Other' || profileData.customGoal)
      case 4:
        return profileData.preferredTimes.length > 0
      case 5:
        return profileData.learningStyle // Bio is optional
      default:
        return false
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    }

    setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await register({
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
        // Include profile data
        subjects: profileData.subjects,
        preferredTimes: profileData.preferredTimes,
        examGoal: profileData.examGoal === 'Other' ? profileData.customGoal : profileData.examGoal,
        learningStyle: profileData.learningStyle,
        bio: profileData.bio,
      })

      // Show the username modal instead of navigating directly
      console.log('Registration successful, userData:', userData)
      if (userData && userData.username) {
        setRegisteredUsername(userData.username)
      setRegisteredUserData(userData) // Store userData for later
      setShowUsernameModal(true)
      } else {
        // Fallback - navigate to dashboard if no username returned
        console.warn('No username returned from registration')
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(registeredUsername)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy username:', err)
    }
  }

  const handleContinue = () => {
    setShowUsernameModal(false)
    // Now set the user in AuthContext to trigger navigation
    if (registeredUserData) {
      setUserAfterRegister(registeredUserData)
    }
    navigate('/dashboard')
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-mesh">
      <div className={`w-full transition-all duration-300 ${step === 1 ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">SM</span>
            </div>
            <span className="font-display text-2xl font-bold text-gradient">Study Match</span>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step > s
                      ? 'bg-primary-500 text-white'
                      : step === s
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < TOTAL_STEPS && (
                  <div className={`w-8 md:w-12 h-1 mx-1 rounded-full transition-colors ${
                    step > s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              {step === 1 && 'Create your account'}
              {step === 2 && 'What do you study?'}
              {step === 3 && "What's your goal?"}
              {step === 4 && 'When do you study?'}
              {step === 5 && 'How do you learn?'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {step === 1 && 'Join the community of learners'}
              {step === 2 && 'Select your subjects to find study partners'}
              {step === 3 && 'Select your primary exam or study goal'}
              {step === 4 && 'Select your preferred study times'}
              {step === 5 && 'Tell us about your learning style'}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl text-sm animate-fade-in ${
              error.includes('Google') 
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400'
                : 'bg-danger-500/10 border border-danger-500/20 text-danger-600 dark:text-danger-400'
            }`}>
              {error.includes('Google') ? (
                <div>
                  <p className="mb-2">{error.replace('OAUTH_USER:', '')}</p>
                  <a 
                    href={GOOGLE_OAUTH_URL}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    </svg>
                    Continue with Google →
                  </a>
                </div>
              ) : error}
            </div>
          )}

          {/* Step 1: Account Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5" autoComplete="on">
            <div>
              <label className="label" htmlFor="displayName">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="displayName"
                  type="text"
                  name="displayName"
                  autoComplete="name"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? strengthColors[strength - 1] : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {strength > 0 ? strengthLabels[strength - 1] : 'Enter a password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success-500" />
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <Link 
                  to="/terms" 
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-500 hover:text-primary-600"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link 
                  to="/privacy" 
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-500 hover:text-primary-600"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {/* Step 2: Subjects */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 p-2">
                {profileOptions.subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => updateProfileData('subjects', toggleItem(profileData.subjects, subject))}
                    className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${
                      profileData.subjects.includes(subject)
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                  placeholder="Add custom subject..."
                  className="input flex-1 text-base"
                />
                <button type="button" onClick={addCustomSubject} className="btn-secondary px-4">
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              {profileData.subjects.length > 0 && (
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-3">
                    Selected subjects ({profileData.subjects.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 text-sm font-medium"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => updateProfileData('subjects', profileData.subjects.filter((s) => s !== subject))}
                          className="hover:text-primary-900 dark:hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary py-3 px-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceedToNextStep()}
                  className="btn-primary flex-1 py-3"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-2">
                {profileOptions.studyGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => updateProfileData('examGoal', goal)}
                    className={`p-4 rounded-xl text-center text-base font-medium transition-all ${
                      profileData.examGoal === goal
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {profileData.examGoal === 'Other' && (
                <input
                  type="text"
                  value={profileData.customGoal}
                  onChange={(e) => updateProfileData('customGoal', e.target.value)}
                  placeholder="Enter your goal..."
                  className="input text-base"
                />
              )}

              <div className="flex justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary py-3 px-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!canProceedToNextStep()}
                  className="btn-primary flex-1 py-3"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => updateProfileData('preferredTimes', toggleItem(profileData.preferredTimes, slot.id))}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                      profileData.preferredTimes.includes(slot.id)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-base">{slot.label}</span>
                    {profileData.preferredTimes.includes(slot.id) && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-secondary py-3 px-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  disabled={!canProceedToNextStep()}
                  className="btn-primary flex-1 py-3"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Learning Style + Bio */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateProfileData('learningStyle', style.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      profileData.learningStyle === style.id
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base">{style.label}</span>
                      {profileData.learningStyle === style.id && <Check className="w-5 h-5" />}
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        profileData.learningStyle === style.id
                          ? 'text-white/80'
                          : 'text-slate-500'
                      }`}
                    >
                      {style.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div>
                <label className="label text-base">Short bio (optional)</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => updateProfileData('bio', e.target.value)}
                  placeholder="Tell potential study partners about yourself..."
                  className="input min-h-[120px] resize-none text-base"
                  maxLength={300}
                />
                <p className="text-sm text-slate-500 mt-2 text-right">
                  {profileData.bio.length}/300
                </p>
              </div>

              <div className="flex justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-secondary py-3 px-6"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !canProceedToNextStep()}
                  className="btn-primary flex-1 py-3 text-lg"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <CheckCircle className="w-6 h-6" />
                </>
              )}
            </button>
              </div>
            </div>
          )}

          {/* Divider - only show on step 1 */}
          {step === 1 && (
            <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-slate-500">or continue with</span>
            </div>
          </div>

              {/* Recommendation Banner */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-center text-primary-700 dark:text-primary-300 font-medium flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  We recommend signing up with Google for a seamless experience
                </p>
          </div>

          {/* Google Sign Up Button */}
          <a
            href={GOOGLE_OAUTH_URL}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-primary-200 dark:border-primary-700 rounded-xl bg-gradient-to-r from-primary-50/50 to-accent-50/50 dark:from-primary-900/10 dark:to-accent-900/10 hover:from-primary-100 hover:to-accent-100 dark:hover:from-primary-900/30 dark:hover:to-accent-900/30 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-slate-700 dark:text-slate-300">Sign up with Google</span>
          </a>

          <p className="text-center mt-6 text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
            </>
          )}
        </div>
      </div>

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-8 md:p-10 max-w-lg w-full animate-fade-in shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-success-500" />
              </div>
              <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">
                Registration Successful!
              </h3>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Welcome to Study Match! Here's your username.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Important: Save your username!
                  </p>
                  <p className="text-base text-amber-700 dark:text-amber-300">
                    You'll need this username to log in. Please copy and save it somewhere safe.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="label text-base mb-3">Your Username</label>
              <div className="flex gap-3">
                <div className="flex-1 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-slate-700 dark:to-slate-600 border-2 border-primary-200 dark:border-slate-500 rounded-xl px-5 py-4 font-mono text-2xl font-bold text-primary-700 dark:text-white text-center">
                  {registeredUsername}
                </div>
                <button
                  onClick={handleCopyUsername}
                  className={`px-5 py-4 rounded-xl transition-all flex items-center gap-2 text-base font-medium ${
                    copied
                      ? 'bg-success-500 text-white'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                💡 <span className="font-medium">Tip:</span> If you forget your username, you can always sign in using <span className="font-semibold">Google Login</span> with the same email address ({formData.email}).
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="btn-primary w-full py-4 text-lg"
            >
              Continue to Dashboard
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

