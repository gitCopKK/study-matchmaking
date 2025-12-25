import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { vi } from 'vitest'

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'USER',
  profileComplete: true,
}

export const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'ADMIN',
  profileComplete: true,
}

// Create a custom render function with providers
const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock API responses
export const mockApiResponse = (data, status = 200) => {
  return Promise.resolve({
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  })
}

export const mockApiError = (message, status = 400) => {
  const error = new Error(message)
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
  }
  return Promise.reject(error)
}

// Mock profile data
export const mockProfile = {
  id: 'profile-id',
  bio: 'Test bio',
  subjects: ['Math', 'Physics'],
  studyGoals: ['Exam prep'],
  availability: 'Weekends',
  learningStyle: 'Visual',
  dailyGoalMinutes: 60,
  weeklyGoalMinutes: 300,
}

// Mock match data
export const mockMatch = {
  id: 'match-id',
  compatibilityScore: 85,
  status: 'PENDING',
  user: {
    id: 'other-user-id',
    displayName: 'Study Partner',
    profile: {
      subjects: ['Math', 'Physics'],
    },
  },
}

// Mock session data
export const mockSession = {
  id: 'session-id',
  title: 'Math Study Session',
  description: 'Studying algebra',
  scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  durationMinutes: 60,
  partner: {
    id: 'partner-id',
    displayName: 'Partner Name',
  },
}

// Mock conversation data
export const mockConversation = {
  id: 'conversation-id',
  unreadCount: 0,
  lastMessage: {
    content: 'Hello!',
    sentAt: new Date().toISOString(),
  },
  otherUser: {
    id: 'other-user-id',
    displayName: 'Chat Partner',
    online: true,
  },
}

// Mock notification data
export const mockNotification = {
  id: 'notification-id',
  message: 'You have a new match!',
  read: false,
  type: 'MATCH',
  createdAt: new Date().toISOString(),
}

// Mock badge data
export const mockBadge = {
  id: 'badge-id',
  name: 'Early Bird',
  emoji: '🌅',
  description: 'Complete a study session before 8 AM',
  earned: true,
}

// Mock activity data
export const mockActivity = {
  id: 'activity-id',
  durationMinutes: 60,
  subject: 'Mathematics',
  date: new Date().toISOString().split('T')[0],
  notes: 'Studied algebra',
}

// Mock stats data
export const mockStats = {
  streak: 7,
  totalMinutes: 1200,
  sessionsThisWeek: 5,
  friendsCount: 3,
  dailyGoalMinutes: 60,
  weeklyGoalMinutes: 300,
  todayMinutes: 45,
  weekMinutes: 180,
  streakAtRisk: false,
  studiedToday: true,
}

// Mock group data
export const mockGroup = {
  id: 'group-id',
  name: 'Study Group',
  description: 'A study group',
  subject: 'General',
  memberCount: 5,
  members: [
    { id: 'member-1', displayName: 'Member 1', role: 'ADMIN' },
    { id: 'member-2', displayName: 'Member 2', role: 'MEMBER' },
  ],
}

