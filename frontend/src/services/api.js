import axios from 'axios'

// Use VITE_API_URL for production, empty string for local dev (Vite proxy handles it)
const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Export API_URL for use in other modules (e.g., WebSocket)
export { API_URL }

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Skip token refresh for auth endpoints - these handle 401 themselves
    const isAuthEndpoint = originalRequest?.url?.includes('/api/auth/login') || 
                           originalRequest?.url?.includes('/api/auth/register')
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }
        
        const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
        const { token, refreshToken: newRefreshToken } = response.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api

// API helper functions
export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
}

export const userApi = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data) => api.put('/api/users/me', data),
  deleteAccount: () => api.delete('/api/users/me'),
  changePassword: (data) => api.post('/api/users/change-password', data),
  search: (query) => api.get('/api/users/search', { params: { query } }),
}

export const profileApi = {
  getMe: () => api.get('/api/profiles/me'),
  updateMe: (data) => api.put('/api/profiles/me', data),
  getById: (id) => api.get(`/api/profiles/${id}`),
  getOptions: () => api.get('/api/profiles/options'),
}

export const matchApi = {
  getSuggestions: () => api.get('/api/matches/suggestions'),
  refreshSuggestions: () => api.post('/api/matches/refresh'),
  accept: (id) => api.post(`/api/matches/${id}/accept`),
  decline: (id) => api.post(`/api/matches/${id}/decline`),
  getMatches: () => api.get('/api/matches'),
  getGroups: () => api.get('/api/groups'),
  sendRequest: (userId) => api.post(`/api/matches/request/${userId}`),
  getRequests: () => api.get('/api/matches/requests'),
}

export const chatApi = {
  getConversations: () => api.get('/api/conversations'),
  getMessages: (conversationId, page = 0) => 
    api.get(`/api/conversations/${conversationId}/messages`, { params: { page } }),
  sendMessage: (conversationId, content) =>
    api.post(`/api/conversations/${conversationId}/messages`, { content }),
  markAsRead: (conversationId) => 
    api.post(`/api/conversations/${conversationId}/read`),
  markAsDelivered: (conversationId) => 
    api.post(`/api/conversations/${conversationId}/delivered`),
  createConversation: (participantIds) => 
    api.post('/api/conversations', { participantIds }),
  getAllUsersForAdmin: () => api.get('/api/admin/users'),
  removeMatch: (userId, deleteChat = true) => {
    console.log('API removeMatch called with:', { userId, deleteChat })
    return api.delete(`/api/matches/user/${userId}?deleteChat=${deleteChat}`)
  },
}

export const sessionApi = {
  getSessions: () => api.get('/api/sessions'),
  getUpcoming: () => api.get('/api/sessions/upcoming'),
  create: (data) => api.post('/api/sessions', data),
  update: (id, data) => api.put(`/api/sessions/${id}`, data),
  delete: (id) => api.delete(`/api/sessions/${id}`),
  join: (id) => api.post(`/api/sessions/${id}/join`),
}

export const groupApi = {
  getGroups: () => api.get('/api/groups'),
  getGroup: (id) => api.get(`/api/groups/${id}`),
  create: (data) => api.post('/api/groups', data),
  addMember: (groupId, userId) => api.post(`/api/groups/${groupId}/members/${userId}`),
  removeMember: (groupId, userId) => api.delete(`/api/groups/${groupId}/members/${userId}`),
}

export const activityApi = {
  getActivities: (startDate, endDate) => 
    api.get('/api/activities', { params: { startDate, endDate } }),
  logActivity: (data) => api.post('/api/activities', data),
  getStats: () => api.get('/api/activities/stats'),
  getStreak: () => api.get('/api/activities/streak'),
}

export const badgeApi = {
  getBadges: () => api.get('/api/badges'),
  getEarnedBadges: () => api.get('/api/badges/earned'),
  getUnseenBadges: () => api.get('/api/badges/unseen'),
  markBadgesAsSeen: () => api.post('/api/badges/mark-seen'),
  getUserBadges: (userId) => api.get(`/api/badges/user/${userId}`),
}

export const notificationApi = {
  getNotifications: (page = 0) => 
    api.get('/api/notifications', { params: { page } }),
  markAsRead: (id) => api.post(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.post('/api/notifications/read-all'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
}

export const adminApi = {
  // Profile options management
  getProfileOptions: () => api.get('/api/admin/profile-options'),
  updateSubjects: (subjects) => api.post('/api/admin/profile-options/subjects', { subjects }),
  addSubject: (subject) => api.post('/api/admin/profile-options/subjects/add', { subject }),
  removeSubject: (subject) => api.post('/api/admin/profile-options/subjects/remove', { subject }),
  updateStudyGoals: (studyGoals) => api.post('/api/admin/profile-options/study-goals', { studyGoals }),
  addStudyGoal: (goal) => api.post('/api/admin/profile-options/study-goals/add', { goal }),
  removeStudyGoal: (goal) => api.post('/api/admin/profile-options/study-goals/remove', { goal }),
}

export const leaderboardApi = {
  getLeaderboard: () => api.get('/api/leaderboard'),
}

export const bugReportApi = {
  // User endpoints
  create: (data) => api.post('/api/bug-reports', data),
  getMyReports: (page = 0) => api.get('/api/bug-reports/my-reports', { params: { page } }),
  
  // Admin endpoints
  getAll: (page = 0, status = null) => 
    api.get('/api/bug-reports', { params: { page, status } }),
  getStats: () => api.get('/api/bug-reports/stats'),
  update: (id, data) => api.put(`/api/bug-reports/${id}`, data),
}

