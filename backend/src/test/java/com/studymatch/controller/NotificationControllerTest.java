package com.studymatch.controller;

import com.studymatch.dto.NotificationDto;
import com.studymatch.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Notification Controller Tests")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Nested
    @DisplayName("GET /api/notifications")
    class GetNotificationsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return paginated notifications")
        void shouldReturnPaginatedNotifications() throws Exception {
            List<NotificationDto> notifications = Arrays.asList(
                createMockNotificationDto("New match found!"),
                createMockNotificationDto("You have a new message")
            );
            when(notificationService.getNotifications(anyInt()))
                .thenReturn(new PageImpl<>(notifications));

            mockMvc.perform(get("/api/notifications")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty page when no notifications")
        void shouldReturnEmptyPageWhenNoNotifications() throws Exception {
            when(notificationService.getNotifications(anyInt()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

            mockMvc.perform(get("/api/notifications")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/notifications"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/notifications/unread-count")
    class GetUnreadCountTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return unread notification count")
        void shouldReturnUnreadNotificationCount() throws Exception {
            when(notificationService.getUnreadCount()).thenReturn(5L);

            mockMvc.perform(get("/api/notifications/unread-count"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(5));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return zero when all read")
        void shouldReturnZeroWhenAllRead() throws Exception {
            when(notificationService.getUnreadCount()).thenReturn(0L);

            mockMvc.perform(get("/api/notifications/unread-count"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(0));
        }
    }

    @Nested
    @DisplayName("POST /api/notifications/{notificationId}/read")
    class MarkAsReadTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should mark notification as read")
        void shouldMarkNotificationAsRead() throws Exception {
            UUID notificationId = UUID.randomUUID();
            doNothing().when(notificationService).markAsRead(any(UUID.class));

            mockMvc.perform(post("/api/notifications/" + notificationId + "/read"))
                    .andExpect(status().isOk());

            verify(notificationService).markAsRead(notificationId);
        }
    }

    @Nested
    @DisplayName("POST /api/notifications/read-all")
    class MarkAllAsReadTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should mark all notifications as read")
        void shouldMarkAllNotificationsAsRead() throws Exception {
            doNothing().when(notificationService).markAllAsRead();

            mockMvc.perform(post("/api/notifications/read-all"))
                    .andExpect(status().isOk());

            verify(notificationService).markAllAsRead();
        }
    }

    private NotificationDto createMockNotificationDto(String message) {
        NotificationDto notification = new NotificationDto();
        notification.setId(UUID.randomUUID());
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notification;
    }
}

