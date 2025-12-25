package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.MatchDto;
import com.studymatch.service.MatchingService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Match Controller Tests")
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MatchingService matchingService;

    @Nested
    @DisplayName("GET /api/matches/suggestions")
    class GetSuggestionsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return match suggestions")
        void shouldReturnMatchSuggestions() throws Exception {
            List<MatchDto> suggestions = Arrays.asList(
                createMockMatchDto(85),
                createMockMatchDto(78),
                createMockMatchDto(72)
            );
            when(matchingService.getSuggestions()).thenReturn(suggestions);

            mockMvc.perform(get("/api/matches/suggestions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3))
                    .andExpect(jsonPath("$[0].compatibilityScore").value(85));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when no suggestions")
        void shouldReturnEmptyListWhenNoSuggestions() throws Exception {
            when(matchingService.getSuggestions()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/matches/suggestions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/matches/suggestions"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/matches")
    class GetMatchesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return mutual matches")
        void shouldReturnMutualMatches() throws Exception {
            List<MatchDto> matches = Arrays.asList(
                createMockMatchDto(90),
                createMockMatchDto(85)
            );
            when(matchingService.getMutualMatches()).thenReturn(matches);

            mockMvc.perform(get("/api/matches"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("POST /api/matches/{matchId}/accept")
    class AcceptMatchTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should accept match successfully")
        void shouldAcceptMatchSuccessfully() throws Exception {
            UUID matchId = UUID.randomUUID();
            MatchDto match = createMockMatchDto(85);
            match.setStatus("ACCEPTED");
            when(matchingService.acceptMatch(matchId)).thenReturn(match);

            mockMvc.perform(post("/api/matches/" + matchId + "/accept"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("ACCEPTED"));
        }
    }

    @Nested
    @DisplayName("POST /api/matches/{matchId}/decline")
    class DeclineMatchTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should decline match successfully")
        void shouldDeclineMatchSuccessfully() throws Exception {
            UUID matchId = UUID.randomUUID();
            doNothing().when(matchingService).declineMatch(matchId);

            mockMvc.perform(post("/api/matches/" + matchId + "/decline"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/matches/refresh")
    class RefreshSuggestionsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should refresh suggestions")
        void shouldRefreshSuggestions() throws Exception {
            List<MatchDto> newSuggestions = Arrays.asList(
                createMockMatchDto(88),
                createMockMatchDto(75)
            );
            doNothing().when(matchingService).clearPendingMatches();
            when(matchingService.getSuggestions()).thenReturn(newSuggestions);

            mockMvc.perform(post("/api/matches/refresh"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("DELETE /api/matches/user/{userId}")
    class RemoveMatchTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should remove match with user including chat")
        void shouldRemoveMatchWithChat() throws Exception {
            UUID userId = UUID.randomUUID();
            doNothing().when(matchingService).removeMatchWithUser(userId, true);

            mockMvc.perform(delete("/api/matches/user/" + userId)
                    .param("deleteChat", "true"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should remove match without deleting chat")
        void shouldRemoveMatchWithoutChat() throws Exception {
            UUID userId = UUID.randomUUID();
            doNothing().when(matchingService).removeMatchWithUser(userId, false);

            mockMvc.perform(delete("/api/matches/user/" + userId)
                    .param("deleteChat", "false"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/matches/request/{userId}")
    class SendMatchRequestTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should send match request")
        void shouldSendMatchRequest() throws Exception {
            UUID userId = UUID.randomUUID();
            MatchDto match = createMockMatchDto(80);
            match.setStatus("PENDING");
            when(matchingService.sendMatchRequest(userId)).thenReturn(match);

            mockMvc.perform(post("/api/matches/request/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }
    }

    @Nested
    @DisplayName("GET /api/matches/requests")
    class GetPendingRequestsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return pending requests")
        void shouldReturnPendingRequests() throws Exception {
            List<MatchDto> requests = Arrays.asList(
                createMockMatchDto(82),
                createMockMatchDto(79)
            );
            when(matchingService.getPendingRequests()).thenReturn(requests);

            mockMvc.perform(get("/api/matches/requests"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    private MatchDto createMockMatchDto(int compatibilityScore) {
        MatchDto match = new MatchDto();
        match.setId(UUID.randomUUID());
        match.setCompatibilityScore(compatibilityScore);
        match.setStatus("PENDING");
        return match;
    }
}

