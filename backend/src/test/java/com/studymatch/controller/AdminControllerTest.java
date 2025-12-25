package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.config.AIConfig;
import com.studymatch.service.AdminService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Admin Controller Tests")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminService adminService;

    @MockBean
    private AIConfig aiConfig;

    @Nested
    @DisplayName("GET /api/admin/dashboard")
    class GetDashboardTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return dashboard stats for admin")
        void shouldReturnDashboardStats() throws Exception {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", 100);
            stats.put("activeUsers", 75);
            stats.put("totalSessions", 500);
            when(adminService.getDashboardStats()).thenReturn(stats);

            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalUsers").value(100))
                    .andExpect(jsonPath("$.activeUsers").value(75));
        }

        @Test
        @WithMockUser(username = "user@example.com", roles = {"USER"})
        @DisplayName("Should return 403 for non-admin user")
        void shouldReturn403ForNonAdmin() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/admin/top-streaks")
    class GetTopStreaksTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return top streak users")
        void shouldReturnTopStreakUsers() throws Exception {
            List<Map<String, Object>> topStreaks = Arrays.asList(
                createUserStreakMap("User 1", 30),
                createUserStreakMap("User 2", 25)
            );
            when(adminService.getTopStreakUsers(anyInt())).thenReturn(topStreaks);

            mockMvc.perform(get("/api/admin/top-streaks")
                    .param("limit", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/top-study-hours")
    class GetTopStudyHoursTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return top study hours users")
        void shouldReturnTopStudyHoursUsers() throws Exception {
            List<Map<String, Object>> topStudyHours = Arrays.asList(
                createUserStudyHoursMap("User A", 2000),
                createUserStudyHoursMap("User B", 1800)
            );
            when(adminService.getTopStudyHoursUsers(anyInt())).thenReturn(topStudyHours);

            mockMvc.perform(get("/api/admin/top-study-hours")
                    .param("limit", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/users")
    class GetAllUsersTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return all users")
        void shouldReturnAllUsers() throws Exception {
            List<Map<String, Object>> users = Arrays.asList(
                createUserMap("user1@example.com", "User 1"),
                createUserMap("user2@example.com", "User 2")
            );
            when(adminService.getAllUsers()).thenReturn(users);

            mockMvc.perform(get("/api/admin/users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("POST /api/admin/users/{userId}/block")
    class BlockUserTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should block user successfully")
        void shouldBlockUserSuccessfully() throws Exception {
            UUID userId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("reason", "Violation of terms");

            doNothing().when(adminService).blockUser(any(UUID.class), anyString());

            mockMvc.perform(post("/api/admin/users/" + userId + "/block")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk());

            verify(adminService).blockUser(eq(userId), eq("Violation of terms"));
        }
    }

    @Nested
    @DisplayName("POST /api/admin/users/{userId}/unblock")
    class UnblockUserTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should unblock user successfully")
        void shouldUnblockUserSuccessfully() throws Exception {
            UUID userId = UUID.randomUUID();
            doNothing().when(adminService).unblockUser(any(UUID.class));

            mockMvc.perform(post("/api/admin/users/" + userId + "/unblock"))
                    .andExpect(status().isOk());

            verify(adminService).unblockUser(userId);
        }
    }

    @Nested
    @DisplayName("AI Settings")
    class AISettingsTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should get AI settings")
        void shouldGetAISettings() throws Exception {
            when(aiConfig.isEnabled()).thenReturn(true);
            when(aiConfig.getMatchLimit()).thenReturn(10);
            
            AIConfig.GroqConfig groqConfig = mock(AIConfig.GroqConfig.class);
            when(groqConfig.getModel()).thenReturn("llama-3.1-70b");
            when(groqConfig.getMaxTokens()).thenReturn(1000);
            when(aiConfig.getGroq()).thenReturn(groqConfig);

            mockMvc.perform(get("/api/admin/ai-settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(true))
                    .andExpect(jsonPath("$.matchLimit").value(10));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should toggle AI settings")
        void shouldToggleAISettings() throws Exception {
            Map<String, Boolean> body = new HashMap<>();
            body.put("enabled", false);

            when(aiConfig.isEnabled()).thenReturn(false);
            doNothing().when(aiConfig).setEnabledAndPersist(anyBoolean());

            mockMvc.perform(post("/api/admin/ai-settings/toggle")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(false));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should set AI match limit")
        void shouldSetAIMatchLimit() throws Exception {
            Map<String, Integer> body = new HashMap<>();
            body.put("limit", 20);

            when(aiConfig.getMatchLimit()).thenReturn(20);
            doNothing().when(aiConfig).setMatchLimitAndPersist(anyInt());

            mockMvc.perform(post("/api/admin/ai-settings/match-limit")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.matchLimit").value(20));
        }
    }

    @Nested
    @DisplayName("Profile Options Management")
    class ProfileOptionsTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should get profile options")
        void shouldGetProfileOptions() throws Exception {
            Map<String, List<String>> options = new HashMap<>();
            options.put("subjects", Arrays.asList("Math", "Physics", "Chemistry"));
            options.put("studyGoals", Arrays.asList("Exam prep", "Skill building"));
            when(adminService.getProfileOptions()).thenReturn(options);

            mockMvc.perform(get("/api/admin/profile-options"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.subjects.length()").value(3))
                    .andExpect(jsonPath("$.studyGoals.length()").value(2));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should add new subject")
        void shouldAddNewSubject() throws Exception {
            Map<String, String> body = new HashMap<>();
            body.put("subject", "Biology");

            List<String> updatedSubjects = Arrays.asList("Math", "Physics", "Chemistry", "Biology");
            when(adminService.addSubject(anyString())).thenReturn(updatedSubjects);

            mockMvc.perform(post("/api/admin/profile-options/subjects/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(4));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should remove subject")
        void shouldRemoveSubject() throws Exception {
            Map<String, String> body = new HashMap<>();
            body.put("subject", "Chemistry");

            List<String> updatedSubjects = Arrays.asList("Math", "Physics");
            when(adminService.removeSubject(anyString())).thenReturn(updatedSubjects);

            mockMvc.perform(post("/api/admin/profile-options/subjects/remove")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should add new study goal")
        void shouldAddNewStudyGoal() throws Exception {
            Map<String, String> body = new HashMap<>();
            body.put("goal", "Research");

            List<String> updatedGoals = Arrays.asList("Exam prep", "Skill building", "Research");
            when(adminService.addStudyGoal(anyString())).thenReturn(updatedGoals);

            mockMvc.perform(post("/api/admin/profile-options/study-goals/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3));
        }
    }

    @Nested
    @DisplayName("Analytics Endpoints")
    class AnalyticsTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should get activity trends")
        void shouldGetActivityTrends() throws Exception {
            Map<String, Object> trends = new HashMap<>();
            trends.put("totalActivities", 1000);
            trends.put("averagePerDay", 33);
            when(adminService.getActivityTrends(anyInt())).thenReturn(trends);

            mockMvc.perform(get("/api/admin/activity-trends")
                    .param("days", "30"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalActivities").value(1000));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should get engagement analytics")
        void shouldGetEngagementAnalytics() throws Exception {
            Map<String, Object> analytics = new HashMap<>();
            analytics.put("dailyActiveUsers", 50);
            analytics.put("retention", 0.75);
            when(adminService.getEngagementAnalytics(anyInt())).thenReturn(analytics);

            mockMvc.perform(get("/api/admin/engagement-analytics")
                    .param("days", "14"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.dailyActiveUsers").value(50));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should get recent activity")
        void shouldGetRecentActivity() throws Exception {
            List<Map<String, Object>> recentActivity = Arrays.asList(
                createActivityMap("User logged in"),
                createActivityMap("User created session")
            );
            when(adminService.getRecentActivity(anyInt())).thenReturn(recentActivity);

            mockMvc.perform(get("/api/admin/recent-activity")
                    .param("limit", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    private Map<String, Object> createUserStreakMap(String name, int streak) {
        Map<String, Object> map = new HashMap<>();
        map.put("displayName", name);
        map.put("streak", streak);
        return map;
    }

    private Map<String, Object> createUserStudyHoursMap(String name, int minutes) {
        Map<String, Object> map = new HashMap<>();
        map.put("displayName", name);
        map.put("totalMinutes", minutes);
        return map;
    }

    private Map<String, Object> createUserMap(String email, String name) {
        Map<String, Object> map = new HashMap<>();
        map.put("email", email);
        map.put("displayName", name);
        map.put("id", UUID.randomUUID().toString());
        return map;
    }

    private Map<String, Object> createActivityMap(String description) {
        Map<String, Object> map = new HashMap<>();
        map.put("description", description);
        map.put("timestamp", "2024-01-15T10:30:00");
        return map;
    }
}

