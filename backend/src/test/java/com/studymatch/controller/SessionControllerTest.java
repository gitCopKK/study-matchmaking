package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.SessionDto;
import com.studymatch.service.SessionService;
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

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Session Controller Tests")
class SessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionService sessionService;

    @Nested
    @DisplayName("GET /api/sessions")
    class GetSessionsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return all user sessions")
        void shouldReturnAllUserSessions() throws Exception {
            List<SessionDto> sessions = Arrays.asList(
                createMockSessionDto("Math Study"),
                createMockSessionDto("Physics Review")
            );
            when(sessionService.getSessions()).thenReturn(sessions);

            mockMvc.perform(get("/api/sessions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].title").value("Math Study"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when no sessions")
        void shouldReturnEmptyListWhenNoSessions() throws Exception {
            when(sessionService.getSessions()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/sessions"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/sessions"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/sessions/upcoming")
    class GetUpcomingSessionsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return upcoming sessions")
        void shouldReturnUpcomingSessions() throws Exception {
            List<SessionDto> upcomingSessions = Arrays.asList(
                createMockSessionDto("Tomorrow's Session"),
                createMockSessionDto("Next Week Session")
            );
            when(sessionService.getUpcomingSessions()).thenReturn(upcomingSessions);

            mockMvc.perform(get("/api/sessions/upcoming"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("POST /api/sessions")
    class CreateSessionTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create session successfully")
        void shouldCreateSessionSuccessfully() throws Exception {
            SessionDto.CreateRequest request = new SessionDto.CreateRequest();
            request.setTitle("New Study Session");
            request.setScheduledAt(LocalDateTime.now().plusDays(1));
            request.setDurationMinutes(60);

            SessionDto createdSession = createMockSessionDto("New Study Session");
            when(sessionService.createSession(any(SessionDto.CreateRequest.class))).thenReturn(createdSession);

            mockMvc.perform(post("/api/sessions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("New Study Session"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create session with partner")
        void shouldCreateSessionWithPartner() throws Exception {
            SessionDto.CreateRequest request = new SessionDto.CreateRequest();
            request.setTitle("Study with Partner");
            request.setScheduledAt(LocalDateTime.now().plusDays(2));
            request.setDurationMinutes(90);
            request.setPartnerId(UUID.randomUUID());

            SessionDto createdSession = createMockSessionDto("Study with Partner");
            when(sessionService.createSession(any(SessionDto.CreateRequest.class))).thenReturn(createdSession);

            mockMvc.perform(post("/api/sessions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /api/sessions/{sessionId}")
    class UpdateSessionTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should update session successfully")
        void shouldUpdateSessionSuccessfully() throws Exception {
            UUID sessionId = UUID.randomUUID();
            SessionDto.UpdateRequest request = new SessionDto.UpdateRequest();
            request.setTitle("Updated Session Title");
            request.setDurationMinutes(120);

            SessionDto updatedSession = createMockSessionDto("Updated Session Title");
            updatedSession.setDurationMinutes(120);
            when(sessionService.updateSession(any(UUID.class), any(SessionDto.UpdateRequest.class)))
                .thenReturn(updatedSession);

            mockMvc.perform(put("/api/sessions/" + sessionId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Updated Session Title"))
                    .andExpect(jsonPath("$.durationMinutes").value(120));
        }
    }

    @Nested
    @DisplayName("DELETE /api/sessions/{sessionId}")
    class DeleteSessionTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should delete session successfully")
        void shouldDeleteSessionSuccessfully() throws Exception {
            UUID sessionId = UUID.randomUUID();
            doNothing().when(sessionService).deleteSession(sessionId);

            mockMvc.perform(delete("/api/sessions/" + sessionId))
                    .andExpect(status().isOk());

            verify(sessionService).deleteSession(sessionId);
        }
    }

    private SessionDto createMockSessionDto(String title) {
        return SessionDto.builder()
                .id(UUID.randomUUID())
                .title(title)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .durationMinutes(60)
                .build();
    }
}

