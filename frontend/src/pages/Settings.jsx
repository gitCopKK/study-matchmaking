import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { userApi, bugReportApi, profileApi } from '../services/api'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Lock,
  User,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Check,
  Bug,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Target,
} from 'lucide-react'

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const toast = useToast()
  
  const [activeTab, setActiveTab] = useState('account')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [accountData, setAccountData] = useState({
    displayName: user?.displayName || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  // Bug Report state
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    category: 'OTHER',
  })
  const [submittingBug, setSubmittingBug] = useState(false)
  const [bugSubmitSuccess, setBugSubmitSuccess] = useState(false)
  const [myBugReports, setMyBugReports] = useState([])
  const [loadingBugs, setLoadingBugs] = useState(false)

  // Study Goals state
  const [goals, setGoals] = useState({
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
  })
  const [savingGoals, setSavingGoals] = useState(false)

  // Load my bug reports and goals when tab changes
  useEffect(() => {
    if (activeTab === 'bugs') {
      loadMyBugReports()
    }
    if (activeTab === 'goals') {
      loadGoals()
    }
  }, [activeTab])

  const loadGoals = async () => {
    try {
      const res = await profileApi.getMe()
      setGoals({
        dailyGoalMinutes: res.data.dailyGoalMinutes || 60,
        weeklyGoalMinutes: res.data.weeklyGoalMinutes || 300,
      })
    } catch (error) {
      console.error('Failed to load goals:', error)
    }
  }

  const handleSaveGoals = async () => {
    setSavingGoals(true)
    try {
      await profileApi.updateMe({
        dailyGoalMinutes: goals.dailyGoalMinutes,
        weeklyGoalMinutes: goals.weeklyGoalMinutes,
      })
      toast.success('Study goals saved successfully!')
    } catch (error) {
      console.error('Failed to save goals:', error)
      toast.error('Failed to save goals')
    } finally {
      setSavingGoals(false)
    }
  }

  const loadMyBugReports = async () => {
    setLoadingBugs(true)
    try {
      const res = await bugReportApi.getMyReports()
      setMyBugReports(res.data.content || [])
    } catch (error) {
      console.error('Failed to load bug reports:', error)
    } finally {
      setLoadingBugs(false)
    }
  }

  const handleSubmitBugReport = async (e) => {
    e.preventDefault()
    if (!bugReport.title.trim() || !bugReport.description.trim()) return
    
    setSubmittingBug(true)
    try {
      await bugReportApi.create({
        ...bugReport,
        browserInfo: navigator.userAgent,
        pageUrl: window.location.href,
      })
      setBugReport({ title: '', description: '', category: 'OTHER' })
      setBugSubmitSuccess(true)
      setTimeout(() => setBugSubmitSuccess(false), 3000)
      loadMyBugReports()
    } catch (error) {
      console.error('Failed to submit bug report:', error)
    } finally {
      setSubmittingBug(false)
    }
  }

  const getBugStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500" />
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'CLOSED': return <Check className="w-4 h-4 text-slate-500" />
      case 'WONT_FIX': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const handleSaveAccount = async () => {
    setSaving(true)
    try {
      await userApi.updateMe(accountData)
      updateUser(accountData)
      toast.success('Account updated successfully')
    } catch (error) {
      console.error('Failed to save account:', error)
      toast.error('Failed to save account')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully')
    } catch (error) {
      console.error('Failed to change password:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to change password'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount()
      logout()
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account')
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'goals', label: 'Study Goals', icon: Target },
    { id: 'appearance', label: 'Appearance', icon: isDark ? Moon : Sun },
    { id: 'bugs', label: 'Report Bug', icon: Bug },
  ]

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-display font-bold flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6 text-primary-500" />
        Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-56 flex-shrink-0">
          <nav className="card p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Display Name</label>
                    <input
                      type="text"
                      value={accountData.displayName}
                      onChange={(e) => setAccountData({ ...accountData, displayName: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input bg-slate-100 dark:bg-slate-700 cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <button
                    onClick={handleSaveAccount}
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
              </div>

              <hr className="border-slate-200 dark:border-slate-700" />

              <div>
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="input pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input"
                    />
                  </div>
                  <button type="submit" className="btn-secondary">
                    Change Password
                  </button>
                </form>
              </div>

              <hr className="border-slate-200 dark:border-slate-700" />

              <div>
                <h2 className="font-display font-semibold text-lg mb-4 text-danger-500 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-slate-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Account"
            size="sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
                <AlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0" />
                <p className="text-danger-700 dark:text-danger-300 text-sm">
                  This action cannot be undone. All your data, matches, and conversations will be permanently deleted.
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Are you sure you want to delete your account?
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    handleDeleteAccount()
                  }}
                  className="btn-danger flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </Modal>

          {/* Study Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-500" />
                  Study Goals
                </h2>
                <p className="text-sm text-slate-500">Set your daily and weekly study targets to stay motivated.</p>
              </div>

              <div className="space-y-6">
                {/* Daily Goal */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span>Daily Study Goal</span>
                    <span className="text-primary-500 font-bold">{goals.dailyGoalMinutes} min</span>
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="480"
                    step="15"
                    value={goals.dailyGoalMinutes}
                    onChange={(e) => setGoals({ ...goals, dailyGoalMinutes: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>15 min</span>
                    <span>8 hours</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[30, 60, 90, 120, 180, 240].map(min => (
                      <button
                        key={min}
                        onClick={() => setGoals({ ...goals, dailyGoalMinutes: min })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          goals.dailyGoalMinutes === min
                            ? 'bg-primary-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {min < 60 ? `${min}m` : `${min/60}h`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly Goal */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span>Weekly Study Goal</span>
                    <span className="text-accent-500 font-bold">{Math.round(goals.weeklyGoalMinutes / 60 * 10) / 10} hours</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="2400"
                    step="60"
                    value={goals.weeklyGoalMinutes}
                    onChange={(e) => setGoals({ ...goals, weeklyGoalMinutes: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1 hour</span>
                    <span>40 hours</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[180, 300, 420, 600, 900, 1200].map(min => (
                      <button
                        key={min}
                        onClick={() => setGoals({ ...goals, weeklyGoalMinutes: min })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          goals.weeklyGoalMinutes === min
                            ? 'bg-accent-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {Math.round(min/60)}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  <strong>Tip:</strong> Start with achievable goals and gradually increase them. Consistency beats intensity!
                </p>
              </div>

              <button
                onClick={handleSaveGoals}
                disabled={savingGoals}
                className="btn-primary"
              >
                {savingGoals ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Goals
                  </>
                )}
              </button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-lg">Appearance</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => isDark && toggleTheme()}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    !isDark
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  <Sun className={`w-8 h-8 mx-auto mb-3 ${!isDark ? 'text-primary-500' : 'text-slate-400'}`} />
                  <p className="font-medium">Light Mode</p>
                  {!isDark && <Check className="w-5 h-5 mx-auto mt-2 text-primary-500" />}
                </button>
                
                <button
                  onClick={() => !isDark && toggleTheme()}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                  }`}
                >
                  <Moon className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-primary-500' : 'text-slate-400'}`} />
                  <p className="font-medium">Dark Mode</p>
                  {isDark && <Check className="w-5 h-5 mx-auto mt-2 text-primary-500" />}
                </button>
              </div>
            </div>
          )}

          {/* Bug Report Tab */}
          {activeTab === 'bugs' && (
            <div className="space-y-6">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Report a Bug
              </h2>

              {bugSubmitSuccess && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 dark:text-green-300">
                    Thank you! Your bug report has been submitted successfully.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitBugReport} className="space-y-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={bugReport.category}
                    onChange={(e) => setBugReport({ ...bugReport, category: e.target.value })}
                    className="input w-full"
                  >
                    <option value="UI_ISSUE">UI Issue</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="CRASH">Crash / Error</option>
                    <option value="LOGIN_ISSUE">Login Issue</option>
                    <option value="MATCHING">Matching</option>
                    <option value="CHAT">Chat</option>
                    <option value="SESSIONS">Sessions</option>
                    <option value="FEATURE_REQUEST">Feature Request</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={bugReport.title}
                    onChange={(e) => setBugReport({ ...bugReport, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="input w-full"
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={bugReport.description}
                    onChange={(e) => setBugReport({ ...bugReport, description: e.target.value })}
                    placeholder="Please describe the issue in detail. Include steps to reproduce if possible."
                    className="input w-full h-32 resize-none"
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {bugReport.description.length}/5000
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingBug || !bugReport.title.trim() || !bugReport.description.trim()}
                  className="btn-primary w-full"
                >
                  {submittingBug ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Bug Report
                    </>
                  )}
                </button>
              </form>

              {/* My Bug Reports */}
              {myBugReports.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-medium mb-4">My Bug Reports</h3>
                  <div className="space-y-3">
                    {myBugReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                      >
                        <div className="flex items-start gap-3">
                          {getBugStatusIcon(report.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                report.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                report.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                report.status === 'RESOLVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                              }`}>
                                {report.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                              {report.description}
                            </p>
                            {report.adminNotes && (
                              <div className="mt-2 p-2 rounded bg-primary-50 dark:bg-primary-900/20 text-sm">
                                <span className="font-medium text-primary-600 dark:text-primary-400">Admin response: </span>
                                {report.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {loadingBugs && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
