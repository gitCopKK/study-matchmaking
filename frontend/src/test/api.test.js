import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, {
  authApi,
  userApi,
  profileApi,
  matchApi,
  chatApi,
  sessionApi,
  groupApi,
  activityApi,
  badgeApi,
  notificationApi,
  adminApi,
  leaderboardApi,
  bugReportApi,
} from '../services/api'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Auth API', () => {
    it('has login method', () => {
      expect(authApi.login).toBeDefined()
      expect(typeof authApi.login).toBe('function')
    })

    it('has register method', () => {
      expect(authApi.register).toBeDefined()
      expect(typeof authApi.register).toBe('function')
    })

    it('has refresh method', () => {
      expect(authApi.refresh).toBeDefined()
      expect(typeof authApi.refresh).toBe('function')
    })

    it('has logout method', () => {
      expect(authApi.logout).toBeDefined()
      expect(typeof authApi.logout).toBe('function')
    })
  })

  describe('User API', () => {
    it('has getMe method', () => {
      expect(userApi.getMe).toBeDefined()
      expect(typeof userApi.getMe).toBe('function')
    })

    it('has updateMe method', () => {
      expect(userApi.updateMe).toBeDefined()
      expect(typeof userApi.updateMe).toBe('function')
    })

    it('has deleteAccount method', () => {
      expect(userApi.deleteAccount).toBeDefined()
      expect(typeof userApi.deleteAccount).toBe('function')
    })

    it('has changePassword method', () => {
      expect(userApi.changePassword).toBeDefined()
      expect(typeof userApi.changePassword).toBe('function')
    })

    it('has search method', () => {
      expect(userApi.search).toBeDefined()
      expect(typeof userApi.search).toBe('function')
    })
  })

  describe('Profile API', () => {
    it('has getMe method', () => {
      expect(profileApi.getMe).toBeDefined()
      expect(typeof profileApi.getMe).toBe('function')
    })

    it('has updateMe method', () => {
      expect(profileApi.updateMe).toBeDefined()
      expect(typeof profileApi.updateMe).toBe('function')
    })

    it('has getById method', () => {
      expect(profileApi.getById).toBeDefined()
      expect(typeof profileApi.getById).toBe('function')
    })

    it('has getOptions method', () => {
      expect(profileApi.getOptions).toBeDefined()
      expect(typeof profileApi.getOptions).toBe('function')
    })
  })

  describe('Match API', () => {
    it('has getSuggestions method', () => {
      expect(matchApi.getSuggestions).toBeDefined()
      expect(typeof matchApi.getSuggestions).toBe('function')
    })

    it('has refreshSuggestions method', () => {
      expect(matchApi.refreshSuggestions).toBeDefined()
      expect(typeof matchApi.refreshSuggestions).toBe('function')
    })

    it('has accept method', () => {
      expect(matchApi.accept).toBeDefined()
      expect(typeof matchApi.accept).toBe('function')
    })

    it('has decline method', () => {
      expect(matchApi.decline).toBeDefined()
      expect(typeof matchApi.decline).toBe('function')
    })

    it('has getMatches method', () => {
      expect(matchApi.getMatches).toBeDefined()
      expect(typeof matchApi.getMatches).toBe('function')
    })

    it('has sendRequest method', () => {
      expect(matchApi.sendRequest).toBeDefined()
      expect(typeof matchApi.sendRequest).toBe('function')
    })

    it('has getRequests method', () => {
      expect(matchApi.getRequests).toBeDefined()
      expect(typeof matchApi.getRequests).toBe('function')
    })
  })

  describe('Chat API', () => {
    it('has getConversations method', () => {
      expect(chatApi.getConversations).toBeDefined()
      expect(typeof chatApi.getConversations).toBe('function')
    })

    it('has getMessages method', () => {
      expect(chatApi.getMessages).toBeDefined()
      expect(typeof chatApi.getMessages).toBe('function')
    })

    it('has sendMessage method', () => {
      expect(chatApi.sendMessage).toBeDefined()
      expect(typeof chatApi.sendMessage).toBe('function')
    })

    it('has markAsRead method', () => {
      expect(chatApi.markAsRead).toBeDefined()
      expect(typeof chatApi.markAsRead).toBe('function')
    })

    it('has markAsDelivered method', () => {
      expect(chatApi.markAsDelivered).toBeDefined()
      expect(typeof chatApi.markAsDelivered).toBe('function')
    })

    it('has createConversation method', () => {
      expect(chatApi.createConversation).toBeDefined()
      expect(typeof chatApi.createConversation).toBe('function')
    })

    it('has removeMatch method', () => {
      expect(chatApi.removeMatch).toBeDefined()
      expect(typeof chatApi.removeMatch).toBe('function')
    })
  })

  describe('Session API', () => {
    it('has getSessions method', () => {
      expect(sessionApi.getSessions).toBeDefined()
      expect(typeof sessionApi.getSessions).toBe('function')
    })

    it('has getUpcoming method', () => {
      expect(sessionApi.getUpcoming).toBeDefined()
      expect(typeof sessionApi.getUpcoming).toBe('function')
    })

    it('has create method', () => {
      expect(sessionApi.create).toBeDefined()
      expect(typeof sessionApi.create).toBe('function')
    })

    it('has update method', () => {
      expect(sessionApi.update).toBeDefined()
      expect(typeof sessionApi.update).toBe('function')
    })

    it('has delete method', () => {
      expect(sessionApi.delete).toBeDefined()
      expect(typeof sessionApi.delete).toBe('function')
    })
  })

  describe('Group API', () => {
    it('has getGroups method', () => {
      expect(groupApi.getGroups).toBeDefined()
      expect(typeof groupApi.getGroups).toBe('function')
    })

    it('has getGroup method', () => {
      expect(groupApi.getGroup).toBeDefined()
      expect(typeof groupApi.getGroup).toBe('function')
    })

    it('has create method', () => {
      expect(groupApi.create).toBeDefined()
      expect(typeof groupApi.create).toBe('function')
    })

    it('has addMember method', () => {
      expect(groupApi.addMember).toBeDefined()
      expect(typeof groupApi.addMember).toBe('function')
    })

    it('has removeMember method', () => {
      expect(groupApi.removeMember).toBeDefined()
      expect(typeof groupApi.removeMember).toBe('function')
    })
  })

  describe('Activity API', () => {
    it('has getActivities method', () => {
      expect(activityApi.getActivities).toBeDefined()
      expect(typeof activityApi.getActivities).toBe('function')
    })

    it('has logActivity method', () => {
      expect(activityApi.logActivity).toBeDefined()
      expect(typeof activityApi.logActivity).toBe('function')
    })

    it('has getStats method', () => {
      expect(activityApi.getStats).toBeDefined()
      expect(typeof activityApi.getStats).toBe('function')
    })
  })

  describe('Badge API', () => {
    it('has getBadges method', () => {
      expect(badgeApi.getBadges).toBeDefined()
      expect(typeof badgeApi.getBadges).toBe('function')
    })

    it('has getEarnedBadges method', () => {
      expect(badgeApi.getEarnedBadges).toBeDefined()
      expect(typeof badgeApi.getEarnedBadges).toBe('function')
    })

    it('has getUnseenBadges method', () => {
      expect(badgeApi.getUnseenBadges).toBeDefined()
      expect(typeof badgeApi.getUnseenBadges).toBe('function')
    })

    it('has markBadgesAsSeen method', () => {
      expect(badgeApi.markBadgesAsSeen).toBeDefined()
      expect(typeof badgeApi.markBadgesAsSeen).toBe('function')
    })

    it('has getUserBadges method', () => {
      expect(badgeApi.getUserBadges).toBeDefined()
      expect(typeof badgeApi.getUserBadges).toBe('function')
    })
  })

  describe('Notification API', () => {
    it('has getNotifications method', () => {
      expect(notificationApi.getNotifications).toBeDefined()
      expect(typeof notificationApi.getNotifications).toBe('function')
    })

    it('has markAsRead method', () => {
      expect(notificationApi.markAsRead).toBeDefined()
      expect(typeof notificationApi.markAsRead).toBe('function')
    })

    it('has markAllAsRead method', () => {
      expect(notificationApi.markAllAsRead).toBeDefined()
      expect(typeof notificationApi.markAllAsRead).toBe('function')
    })

    it('has getUnreadCount method', () => {
      expect(notificationApi.getUnreadCount).toBeDefined()
      expect(typeof notificationApi.getUnreadCount).toBe('function')
    })
  })

  describe('Admin API', () => {
    it('has getProfileOptions method', () => {
      expect(adminApi.getProfileOptions).toBeDefined()
      expect(typeof adminApi.getProfileOptions).toBe('function')
    })

    it('has updateSubjects method', () => {
      expect(adminApi.updateSubjects).toBeDefined()
      expect(typeof adminApi.updateSubjects).toBe('function')
    })

    it('has addSubject method', () => {
      expect(adminApi.addSubject).toBeDefined()
      expect(typeof adminApi.addSubject).toBe('function')
    })

    it('has removeSubject method', () => {
      expect(adminApi.removeSubject).toBeDefined()
      expect(typeof adminApi.removeSubject).toBe('function')
    })

    it('has updateStudyGoals method', () => {
      expect(adminApi.updateStudyGoals).toBeDefined()
      expect(typeof adminApi.updateStudyGoals).toBe('function')
    })

    it('has addStudyGoal method', () => {
      expect(adminApi.addStudyGoal).toBeDefined()
      expect(typeof adminApi.addStudyGoal).toBe('function')
    })

    it('has removeStudyGoal method', () => {
      expect(adminApi.removeStudyGoal).toBeDefined()
      expect(typeof adminApi.removeStudyGoal).toBe('function')
    })
  })

  describe('Leaderboard API', () => {
    it('has getLeaderboard method', () => {
      expect(leaderboardApi.getLeaderboard).toBeDefined()
      expect(typeof leaderboardApi.getLeaderboard).toBe('function')
    })
  })

  describe('Bug Report API', () => {
    it('has create method', () => {
      expect(bugReportApi.create).toBeDefined()
      expect(typeof bugReportApi.create).toBe('function')
    })

    it('has getMyReports method', () => {
      expect(bugReportApi.getMyReports).toBeDefined()
      expect(typeof bugReportApi.getMyReports).toBe('function')
    })

    it('has getAll method', () => {
      expect(bugReportApi.getAll).toBeDefined()
      expect(typeof bugReportApi.getAll).toBe('function')
    })

    it('has getStats method', () => {
      expect(bugReportApi.getStats).toBeDefined()
      expect(typeof bugReportApi.getStats).toBe('function')
    })

    it('has update method', () => {
      expect(bugReportApi.update).toBeDefined()
      expect(typeof bugReportApi.update).toBe('function')
    })
  })
})

