# Study Match Maker - Comprehensive Test Cases

## Overview

This document lists all testable features in the Study Match Maker application, organized by module. Both backend (Java/Spring Boot) and frontend (React/Vite) tests are included.

---

## 📦 BACKEND TEST CASES

### 1. Authentication Module (`AuthController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| AUTH-001 | User Registration | Register with valid email, password, displayName | ⏳ |
| AUTH-002 | Registration Validation | Fail registration with invalid email format | ⏳ |
| AUTH-003 | Registration Validation | Fail registration with empty password | ⏳ |
| AUTH-004 | Registration Validation | Fail registration with missing displayName | ⏳ |
| AUTH-005 | User Login | Login with valid credentials | ⏳ |
| AUTH-006 | Login Validation | Fail login with empty username | ⏳ |
| AUTH-007 | Login Validation | Fail login with empty password | ⏳ |
| AUTH-008 | Token Refresh | Refresh JWT token successfully | ⏳ |
| AUTH-009 | Logout | Logout endpoint responds OK | ⏳ |

### 2. User Management Module (`UserController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| USER-001 | Get Current User | Return authenticated user info | ⏳ |
| USER-002 | Auth Required | Return 401 when not authenticated | ⏳ |
| USER-003 | Update User | Update display name successfully | ⏳ |
| USER-004 | Change Password | Change password with valid current password | ⏳ |
| USER-005 | Search Users | Search users by query string | ⏳ |
| USER-006 | Search Users | Return empty list for no matches | ⏳ |
| USER-007 | Delete Account | Delete user account successfully | ⏳ |

### 3. Profile Management Module (`ProfileController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| PROF-001 | Get Profile | Return current user's profile | ⏳ |
| PROF-002 | Auth Required | Return 401 when not authenticated | ⏳ |
| PROF-003 | Update Profile | Update bio, subjects, goals successfully | ⏳ |
| PROF-004 | Update Goals | Update daily/weekly study goals | ⏳ |
| PROF-005 | Get Other Profile | Get profile by user ID | ⏳ |
| PROF-006 | Profile Options | Get available subjects and goals | ⏳ |

### 4. Matching Module (`MatchController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| MATCH-001 | Get Suggestions | Return match suggestions | ⏳ |
| MATCH-002 | Empty Suggestions | Return empty list when no suggestions | ⏳ |
| MATCH-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| MATCH-004 | Get Mutual Matches | Return accepted mutual matches | ⏳ |
| MATCH-005 | Accept Match | Accept a pending match | ⏳ |
| MATCH-006 | Decline Match | Decline a pending match | ⏳ |
| MATCH-007 | Refresh Suggestions | Clear pending and get new suggestions | ⏳ |
| MATCH-008 | Remove Match | Remove match with chat deletion | ⏳ |
| MATCH-009 | Remove Match | Remove match without chat deletion | ⏳ |
| MATCH-010 | Send Request | Send match request to user | ⏳ |
| MATCH-011 | Get Requests | Get pending match requests | ⏳ |

### 5. Groups Module (`GroupController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| GRP-001 | Get Groups | Return user's study groups | ⏳ |
| GRP-002 | Empty Groups | Return empty list when no groups | ⏳ |
| GRP-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| GRP-004 | Get Single Group | Return group by ID | ⏳ |
| GRP-005 | Create Group | Create new study group | ⏳ |
| GRP-006 | Add Member | Add member to group | ⏳ |
| GRP-007 | Remove Member | Remove member from group | ⏳ |

### 6. Chat/Conversations Module (`ConversationController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| CHAT-001 | Get Conversations | Return user's conversations | ⏳ |
| CHAT-002 | Empty Conversations | Return empty list when none | ⏳ |
| CHAT-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| CHAT-004 | Create Conversation | Create or get conversation | ⏳ |
| CHAT-005 | Get Messages | Return paginated messages | ⏳ |
| CHAT-006 | Get Messages Page | Return specific page of messages | ⏳ |
| CHAT-007 | Send Message | Send message to conversation | ⏳ |
| CHAT-008 | Mark Read | Mark conversation as read | ⏳ |
| CHAT-009 | Mark Delivered | Mark conversation as delivered | ⏳ |

### 7. Sessions Module (`SessionController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| SES-001 | Get Sessions | Return all user sessions | ⏳ |
| SES-002 | Empty Sessions | Return empty list when none | ⏳ |
| SES-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| SES-004 | Get Upcoming | Return upcoming sessions | ⏳ |
| SES-005 | Create Session | Create new study session | ⏳ |
| SES-006 | Create with Partner | Create session with partner | ⏳ |
| SES-007 | Update Session | Update session details | ⏳ |
| SES-008 | Delete Session | Delete a session | ⏳ |

### 8. Activity Module (`ActivityController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| ACT-001 | Get Activities | Return activities in date range | ⏳ |
| ACT-002 | Empty Activities | Return empty list when none | ⏳ |
| ACT-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| ACT-004 | Missing Params | Return 400 when date params missing | ⏳ |
| ACT-005 | Log Activity | Log new study activity | ⏳ |
| ACT-006 | Log Short Activity | Log 15-minute activity | ⏳ |
| ACT-007 | Log Long Activity | Log 4-hour activity | ⏳ |
| ACT-008 | Get Stats | Return activity statistics | ⏳ |
| ACT-009 | Streak at Risk | Return streak risk warning | ⏳ |
| ACT-010 | New User Stats | Return zero stats for new user | ⏳ |

### 9. Badge Module (`BadgeController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| BADGE-001 | Get All Badges | Return all badges with earned status | ⏳ |
| BADGE-002 | Auth Required | Return 401 when not authenticated | ⏳ |
| BADGE-003 | Get Earned | Return only earned badges | ⏳ |
| BADGE-004 | Empty Earned | Return empty list when none earned | ⏳ |
| BADGE-005 | Get Unseen | Return unseen badge notifications | ⏳ |
| BADGE-006 | All Seen | Return empty when all seen | ⏳ |
| BADGE-007 | Mark Seen | Mark badges as seen | ⏳ |
| BADGE-008 | User Badges | Get badges for specific user | ⏳ |

### 10. Leaderboard Module (`LeaderboardController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| LDR-001 | Get Leaderboard | Return leaderboard data | ⏳ |
| LDR-002 | User Rankings | Return with user rankings | ⏳ |
| LDR-003 | Auth Required | Return 401 when not authenticated | ⏳ |

### 11. Notifications Module (`NotificationController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| NOTIF-001 | Get Notifications | Return paginated notifications | ⏳ |
| NOTIF-002 | Empty Notifications | Return empty page when none | ⏳ |
| NOTIF-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| NOTIF-004 | Unread Count | Return unread notification count | ⏳ |
| NOTIF-005 | Zero Unread | Return zero when all read | ⏳ |
| NOTIF-006 | Mark Read | Mark single notification as read | ⏳ |
| NOTIF-007 | Mark All Read | Mark all notifications as read | ⏳ |

### 12. Admin Module (`AdminController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| ADM-001 | Dashboard Stats | Return dashboard statistics | ⏳ |
| ADM-002 | Non-Admin Blocked | Return 403 for non-admin users | ⏳ |
| ADM-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| ADM-004 | Top Streaks | Return top streak users | ⏳ |
| ADM-005 | Top Study Hours | Return top study hours users | ⏳ |
| ADM-006 | All Users | Return all users list | ⏳ |
| ADM-007 | Block User | Block user with reason | ⏳ |
| ADM-008 | Unblock User | Unblock a blocked user | ⏳ |
| ADM-009 | AI Settings Get | Get AI configuration | ⏳ |
| ADM-010 | AI Toggle | Toggle AI enabled/disabled | ⏳ |
| ADM-011 | AI Match Limit | Set AI match limit | ⏳ |
| ADM-012 | Profile Options | Get profile options | ⏳ |
| ADM-013 | Add Subject | Add new subject option | ⏳ |
| ADM-014 | Remove Subject | Remove subject option | ⏳ |
| ADM-015 | Add Study Goal | Add new study goal | ⏳ |
| ADM-016 | Activity Trends | Get activity trends | ⏳ |
| ADM-017 | Engagement Analytics | Get engagement analytics | ⏳ |
| ADM-018 | Recent Activity | Get recent activity feed | ⏳ |

### 13. AI Assistant Module (`AIAssistantController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| AI-001 | Get Status | Return AI enabled status | ⏳ |
| AI-002 | Status Disabled | Return AI disabled status | ⏳ |
| AI-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| AI-004 | Toggle On | Toggle AI on | ⏳ |
| AI-005 | Toggle Off | Toggle AI off | ⏳ |
| AI-006 | Explain Concept | Get concept explanation | ⏳ |
| AI-007 | Generate Quiz | Generate quiz questions | ⏳ |
| AI-008 | Default Quiz Count | Generate with default count | ⏳ |
| AI-009 | Flashcards | Generate flashcards | ⏳ |
| AI-010 | Study Plan | Generate study plan | ⏳ |
| AI-011 | Resources | Get resource recommendations | ⏳ |
| AI-012 | Chat | Chat with AI assistant | ⏳ |
| AI-013 | Chat History | Chat with conversation history | ⏳ |

### 14. Bug Reports Module (`BugReportController`)

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| BUG-001 | Create Report | Create bug report | ⏳ |
| BUG-002 | All Categories | Test all bug categories | ⏳ |
| BUG-003 | Auth Required | Return 401 when not authenticated | ⏳ |
| BUG-004 | My Reports | Get user's bug reports | ⏳ |
| BUG-005 | Empty Reports | Return empty when none | ⏳ |
| BUG-006 | Admin Get All | Admin gets all reports | ⏳ |
| BUG-007 | Filter by Status | Filter reports by status | ⏳ |
| BUG-008 | Non-Admin Blocked | Return 403 for non-admin | ⏳ |
| BUG-009 | Admin Stats | Get bug report statistics | ⏳ |
| BUG-010 | Update Status | Update report status | ⏳ |
| BUG-011 | Update Priority | Update report priority | ⏳ |
| BUG-012 | Admin Notes | Add admin notes | ⏳ |
| BUG-013 | Multi-field Update | Update multiple fields | ⏳ |

---

## 🎨 FRONTEND TEST CASES

### 15. Authentication UI

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| FE-AUTH-001 | Login Form Render | Login form displays correctly | ⏳ |
| FE-AUTH-002 | Empty Email | Validation for empty email | ⏳ |
| FE-AUTH-003 | Invalid Email | Validation for invalid email format | ⏳ |
| FE-AUTH-004 | Login API Call | Login calls API with credentials | ⏳ |
| FE-AUTH-005 | Login Error | Show error on login failure | ⏳ |
| FE-AUTH-006 | Register Link | Link to registration page | ⏳ |
| FE-AUTH-007 | Password Toggle | Toggle password visibility | ⏳ |
| FE-AUTH-008 | Register Form | Registration form displays | ⏳ |
| FE-AUTH-009 | Password Length | Validate password min length | ⏳ |
| FE-AUTH-010 | Register API | Register calls API | ⏳ |
| FE-AUTH-011 | Register Error | Show error on register failure | ⏳ |
| FE-AUTH-012 | Login Link | Link to login page | ⏳ |
| FE-AUTH-013 | Legal Links | Terms and privacy links | ⏳ |

### 16. UI Components

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| FE-COMP-001 | Avatar Initials | Display initials from name | ⏳ |
| FE-COMP-002 | Avatar Single Name | Display first letter | ⏳ |
| FE-COMP-003 | Avatar Empty | Handle empty name | ⏳ |
| FE-COMP-004 | Avatar Undefined | Handle undefined name | ⏳ |
| FE-COMP-005 | Avatar Size LG | Apply large size classes | ⏳ |
| FE-COMP-006 | Avatar Size SM | Apply small size classes | ⏳ |
| FE-COMP-007 | Avatar Online | Show online indicator | ⏳ |
| FE-COMP-008 | Avatar Offline | Hide online indicator | ⏳ |
| FE-COMP-009 | Badge Render | Display emoji and name | ⏳ |
| FE-COMP-010 | Badge Description | Show description | ⏳ |
| FE-COMP-011 | Badge Earned | Earned state styling | ⏳ |
| FE-COMP-012 | Badge Unearned | Unearned state styling | ⏳ |
| FE-COMP-013 | Badge Progress | Render progress bar | ⏳ |
| FE-COMP-014 | Spinner Default | Default spinner size | ⏳ |
| FE-COMP-015 | Spinner Large | Large spinner size | ⏳ |
| FE-COMP-016 | Spinner Small | Small spinner size | ⏳ |
| FE-COMP-017 | Spinner Class | Custom className | ⏳ |
| FE-COMP-018 | Modal Open | Render when open | ⏳ |
| FE-COMP-019 | Modal Closed | Hidden when closed | ⏳ |
| FE-COMP-020 | Modal Close Button | Close on button click | ⏳ |
| FE-COMP-021 | Modal Backdrop | Close on backdrop click | ⏳ |
| FE-COMP-022 | Modal Sizes | Different modal sizes | ⏳ |
| FE-COMP-023 | Modal Children | Render children content | ⏳ |

### 17. API Service

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| FE-API-001 | Auth API Methods | All auth methods exist | ⏳ |
| FE-API-002 | User API Methods | All user methods exist | ⏳ |
| FE-API-003 | Profile API Methods | All profile methods exist | ⏳ |
| FE-API-004 | Match API Methods | All match methods exist | ⏳ |
| FE-API-005 | Chat API Methods | All chat methods exist | ⏳ |
| FE-API-006 | Session API Methods | All session methods exist | ⏳ |
| FE-API-007 | Group API Methods | All group methods exist | ⏳ |
| FE-API-008 | Activity API Methods | All activity methods exist | ⏳ |
| FE-API-009 | Badge API Methods | All badge methods exist | ⏳ |
| FE-API-010 | Notification API Methods | All notification methods exist | ⏳ |
| FE-API-011 | Admin API Methods | All admin methods exist | ⏳ |
| FE-API-012 | Leaderboard API Methods | Leaderboard methods exist | ⏳ |
| FE-API-013 | Bug Report API Methods | Bug report methods exist | ⏳ |

### 18. Context Providers

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| FE-CTX-001 | Auth User State | Provides user state | ⏳ |
| FE-CTX-002 | Auth Login | Provides login function | ⏳ |
| FE-CTX-003 | Auth Register | Provides register function | ⏳ |
| FE-CTX-004 | Auth Logout | Provides logout function | ⏳ |
| FE-CTX-005 | Auth UpdateUser | Provides updateUser function | ⏳ |
| FE-CTX-006 | Auth RefreshUser | Provides refreshUser function | ⏳ |
| FE-CTX-007 | Auth Outside Provider | Throws error outside provider | ⏳ |
| FE-CTX-008 | Theme isDark | Provides isDark state | ⏳ |
| FE-CTX-009 | Theme Toggle | Provides toggleTheme function | ⏳ |
| FE-CTX-010 | Theme Toggles | Actually toggles dark mode | ⏳ |
| FE-CTX-011 | Theme Persist | Persists to localStorage | ⏳ |
| FE-CTX-012 | Theme Load | Loads from localStorage | ⏳ |

### 19. Utility Functions

| Test ID | Feature | Description | Status |
|---------|---------|-------------|--------|
| FE-UTIL-001 | Get Initials | Extract initials from name | ⏳ |
| FE-UTIL-002 | Truncate Text | Truncate with ellipsis | ⏳ |
| FE-UTIL-003 | Format Date | Format date for display | ⏳ |
| FE-UTIL-004 | Time Difference | Calculate time diff | ⏳ |
| FE-UTIL-005 | Is Today | Check if date is today | ⏳ |
| FE-UTIL-006 | Format Duration | Format minutes to hours | ⏳ |
| FE-UTIL-007 | Calculate Percentage | Calculate percentage | ⏳ |
| FE-UTIL-008 | Clamp Value | Clamp between min/max | ⏳ |
| FE-UTIL-009 | Group By | Group array by key | ⏳ |
| FE-UTIL-010 | Unique | Remove duplicates | ⏳ |
| FE-UTIL-011 | Sort By | Sort by property | ⏳ |
| FE-UTIL-012 | Valid Email | Validate email format | ⏳ |
| FE-UTIL-013 | Strong Password | Validate password strength | ⏳ |
| FE-UTIL-014 | Is Empty | Check object empty | ⏳ |
| FE-UTIL-015 | Query Params | Extract URL params | ⏳ |
| FE-UTIL-016 | Build Query | Build query string | ⏳ |

---

## 🧪 Running Tests

### Backend Tests (Java/Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AuthControllerTest

# Run with verbose output
./mvnw test -X

# Generate test report
./mvnw test jacoco:report
```

### Frontend Tests (React/Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Run All Tests At Once

```bash
# From project root
./run-all-tests.sh
```

---

## 📊 Test Summary

| Module | Total Tests | Backend | Frontend |
|--------|-------------|---------|----------|
| Authentication | 22 | 9 | 13 |
| User Management | 7 | 7 | - |
| Profile | 6 | 6 | - |
| Matching | 11 | 11 | - |
| Groups | 7 | 7 | - |
| Chat | 9 | 9 | - |
| Sessions | 8 | 8 | - |
| Activities | 10 | 10 | - |
| Badges | 8 | 8 | - |
| Leaderboard | 3 | 3 | - |
| Notifications | 7 | 7 | - |
| Admin | 18 | 18 | - |
| AI Assistant | 13 | 13 | - |
| Bug Reports | 13 | 13 | - |
| UI Components | - | - | 23 |
| API Service | - | - | 13 |
| Context | - | - | 12 |
| Utilities | - | - | 16 |
| **TOTAL** | **206** | **129** | **77** |

---

## ✅ Test Categories Legend

- ⏳ Pending - Test not yet run
- ✅ Passed - Test passed
- ❌ Failed - Test failed
- ⚠️ Skipped - Test skipped

---

*Last Updated: December 25, 2024*

