package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.ActivityDto;
import com.studymatch.service.ActivityService;
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

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Activity Controller Tests")
class ActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActivityService activityService;

    @Nested
    @DisplayName("GET /api/activities")
    class GetActivitiesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return activities in date range")
        void shouldReturnActivitiesInDateRange() throws Exception {
            List<ActivityDto> activities = Arrays.asList(
                createMockActivityDto(60, "Math"),
                createMockActivityDto(90, "Physics")
            );
            when(activityService.getActivities(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(activities);

            mockMvc.perform(get("/api/activities")
                    .param("startDate", "2024-01-01")
                    .param("endDate", "2024-01-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].durationMinutes").value(60));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when no activities in range")
        void shouldReturnEmptyListWhenNoActivities() throws Exception {
            when(activityService.getActivities(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/activities")
                    .param("startDate", "2024-01-01")
                    .param("endDate", "2024-01-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/activities")
                    .param("startDate", "2024-01-01")
                    .param("endDate", "2024-01-31"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return 400 when missing date parameters")
        void shouldReturn400WhenMissingDateParameters() throws Exception {
            mockMvc.perform(get("/api/activities"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/activities")
    class LogActivityTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should log activity successfully")
        void shouldLogActivitySuccessfully() throws Exception {
            ActivityDto.CreateRequest request = new ActivityDto.CreateRequest();
            request.setStudyMinutes(60);
            request.setTopicsStudied(java.util.Arrays.asList("Mathematics"));
            request.setActivityDate(LocalDate.now());
            request.setNotes("Studied algebra");

            ActivityDto loggedActivity = createMockActivityDto(60, "Mathematics");
            when(activityService.logActivity(any(ActivityDto.CreateRequest.class))).thenReturn(loggedActivity);

            mockMvc.perform(post("/api/activities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.studyMinutes").value(60));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should log short activity")
        void shouldLogShortActivity() throws Exception {
            ActivityDto.CreateRequest request = new ActivityDto.CreateRequest();
            request.setStudyMinutes(15);
            request.setTopicsStudied(java.util.Arrays.asList("Quick review"));
            request.setActivityDate(LocalDate.now());

            ActivityDto loggedActivity = createMockActivityDto(15, "Quick review");
            when(activityService.logActivity(any(ActivityDto.CreateRequest.class))).thenReturn(loggedActivity);

            mockMvc.perform(post("/api/activities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.studyMinutes").value(15));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should log long study session")
        void shouldLogLongStudySession() throws Exception {
            ActivityDto.CreateRequest request = new ActivityDto.CreateRequest();
            request.setStudyMinutes(240);
            request.setTopicsStudied(java.util.Arrays.asList("Exam preparation"));
            request.setActivityDate(LocalDate.now());

            ActivityDto loggedActivity = createMockActivityDto(240, "Exam preparation");
            when(activityService.logActivity(any(ActivityDto.CreateRequest.class))).thenReturn(loggedActivity);

            mockMvc.perform(post("/api/activities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.studyMinutes").value(240));
        }
    }

    @Nested
    @DisplayName("GET /api/activities/stats")
    class GetStatsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return activity stats")
        void shouldReturnActivityStats() throws Exception {
            ActivityDto.Stats stats = new ActivityDto.Stats();
            stats.setStreak(7);
            stats.setTotalMinutes(1200);
            stats.setSessionsThisWeek(5);
            stats.setFriendsCount(3);
            stats.setDailyGoalMinutes(60);
            stats.setWeeklyGoalMinutes(300);
            stats.setTodayMinutes(45);
            stats.setWeekMinutes(180);
            stats.setStreakAtRisk(false);
            stats.setStudiedToday(true);
            
            when(activityService.getStats()).thenReturn(stats);

            mockMvc.perform(get("/api/activities/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.streak").value(7))
                    .andExpect(jsonPath("$.totalMinutes").value(1200))
                    .andExpect(jsonPath("$.sessionsThisWeek").value(5))
                    .andExpect(jsonPath("$.dailyGoalMinutes").value(60))
                    .andExpect(jsonPath("$.studiedToday").value(true));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return streak at risk warning")
        void shouldReturnStreakAtRiskWarning() throws Exception {
            ActivityDto.Stats stats = new ActivityDto.Stats();
            stats.setStreak(5);
            stats.setStreakAtRisk(true);
            stats.setStudiedToday(false);
            
            when(activityService.getStats()).thenReturn(stats);

            mockMvc.perform(get("/api/activities/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.streakAtRisk").value(true))
                    .andExpect(jsonPath("$.studiedToday").value(false));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return zero stats for new user")
        void shouldReturnZeroStatsForNewUser() throws Exception {
            ActivityDto.Stats stats = new ActivityDto.Stats();
            stats.setStreak(0);
            stats.setTotalMinutes(0);
            stats.setSessionsThisWeek(0);
            stats.setFriendsCount(0);
            
            when(activityService.getStats()).thenReturn(stats);

            mockMvc.perform(get("/api/activities/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.streak").value(0))
                    .andExpect(jsonPath("$.totalMinutes").value(0));
        }
    }

    private ActivityDto createMockActivityDto(int studyMinutes, String topic) {
        return ActivityDto.builder()
                .id(UUID.randomUUID())
                .studyMinutes(studyMinutes)
                .topicsStudied(java.util.Arrays.asList(topic))
                .activityDate(LocalDate.now())
                .build();
    }
}

