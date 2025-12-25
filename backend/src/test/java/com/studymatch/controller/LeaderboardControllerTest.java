package com.studymatch.controller;

import com.studymatch.dto.LeaderboardDto;
import com.studymatch.service.LeaderboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Leaderboard Controller Tests")
class LeaderboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeaderboardService leaderboardService;

    @Nested
    @DisplayName("GET /api/leaderboard")
    class GetLeaderboardTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return leaderboard data")
        void shouldReturnLeaderboardData() throws Exception {
            LeaderboardDto leaderboard = createMockLeaderboard();
            when(leaderboardService.getLeaderboard()).thenReturn(leaderboard);

            mockMvc.perform(get("/api/leaderboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topByStreak").isArray())
                    .andExpect(jsonPath("$.topByStudyHours").isArray())
                    .andExpect(jsonPath("$.currentUserRank").exists());
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return leaderboard with user rankings")
        void shouldReturnLeaderboardWithUserRankings() throws Exception {
            LeaderboardDto leaderboard = createMockLeaderboard();
            when(leaderboardService.getLeaderboard()).thenReturn(leaderboard);

            mockMvc.perform(get("/api/leaderboard"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.topStreaks").isArray());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/leaderboard"))
                    .andExpect(status().isUnauthorized());
        }
    }

    private LeaderboardDto createMockLeaderboard() {
        List<LeaderboardDto.LeaderboardEntry> topStreaks = new ArrayList<>();
        topStreaks.add(createMockEntry("User 1", 1, 30));
        topStreaks.add(createMockEntry("User 2", 2, 25));
        topStreaks.add(createMockEntry("User 3", 3, 20));
        
        List<LeaderboardDto.LeaderboardEntry> topStudyHours = new ArrayList<>();
        topStudyHours.add(createMockEntry("User A", 1, 2000));
        topStudyHours.add(createMockEntry("User B", 2, 1800));
        topStudyHours.add(createMockEntry("User C", 3, 1600));
        
        return LeaderboardDto.builder()
                .topStreaks(topStreaks)
                .topStudyHours(topStudyHours)
                .build();
    }

    private LeaderboardDto.LeaderboardEntry createMockEntry(String name, int rank, int value) {
        return LeaderboardDto.LeaderboardEntry.builder()
                .userId(UUID.randomUUID())
                .displayName(name)
                .rank(rank)
                .value(value)
                .build();
    }
}

