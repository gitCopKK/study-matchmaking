package com.studymatch.controller;

import com.studymatch.dto.BadgeDto;
import com.studymatch.model.User;
import com.studymatch.service.BadgeService;
import com.studymatch.service.UserService;
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
@DisplayName("Badge Controller Tests")
class BadgeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BadgeService badgeService;

    @MockBean
    private UserService userService;

    @Nested
    @DisplayName("GET /api/badges")
    class GetBadgesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return all badges with earned status")
        void shouldReturnAllBadgesWithEarnedStatus() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            
            BadgeDto.BadgeListResponse response = BadgeDto.BadgeListResponse.builder()
                    .earnedBadges(Arrays.asList(createMockBadgeDto("Early Bird", "🌅", true)))
                    .availableBadges(Arrays.asList(createMockBadgeDto("Night Owl", "🦉", false)))
                    .totalEarned(1)
                    .totalAvailable(2)
                    .build();
            
            when(badgeService.getBadges(any(User.class))).thenReturn(response);

            mockMvc.perform(get("/api/badges"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalEarned").value(1))
                    .andExpect(jsonPath("$.totalAvailable").value(2));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/badges"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/badges/earned")
    class GetEarnedBadgesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return only earned badges")
        void shouldReturnOnlyEarnedBadges() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            
            List<BadgeDto> earnedBadges = Arrays.asList(
                createMockBadgeDto("Early Bird", "🌅", true),
                createMockBadgeDto("Streak Master", "🔥", true)
            );
            when(badgeService.getEarnedBadges(any(User.class))).thenReturn(earnedBadges);

            mockMvc.perform(get("/api/badges/earned"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].earned").value(true));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when no badges earned")
        void shouldReturnEmptyListWhenNoBadgesEarned() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            when(badgeService.getEarnedBadges(any(User.class))).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/badges/earned"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/badges/unseen")
    class GetUnseenBadgesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return unseen badge notifications")
        void shouldReturnUnseenBadgeNotifications() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            
            List<BadgeDto.NewBadgeNotification> unseenBadges = Arrays.asList(
                createMockBadgeNotification("New Badge", "🏆")
            );
            when(badgeService.getUnseenBadges(any(User.class))).thenReturn(unseenBadges);

            mockMvc.perform(get("/api/badges/unseen"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].name").value("New Badge"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when all badges seen")
        void shouldReturnEmptyListWhenAllBadgesSeen() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            when(badgeService.getUnseenBadges(any(User.class))).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/badges/unseen"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("POST /api/badges/mark-seen")
    class MarkBadgesAsSeenTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should mark badges as seen")
        void shouldMarkBadgesAsSeen() throws Exception {
            User mockUser = createMockUser();
            when(userService.getCurrentUser()).thenReturn(mockUser);
            doNothing().when(badgeService).markBadgesAsSeen(any(User.class));

            mockMvc.perform(post("/api/badges/mark-seen"))
                    .andExpect(status().isOk());

            verify(badgeService).markBadgesAsSeen(any(User.class));
        }
    }

    @Nested
    @DisplayName("GET /api/badges/user/{userId}")
    class GetUserBadgesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return badges for specific user")
        void shouldReturnBadgesForSpecificUser() throws Exception {
            UUID userId = UUID.randomUUID();
            User targetUser = createMockUser();
            targetUser.setId(userId);
            
            when(userService.getUserById(userId)).thenReturn(targetUser);
            
            List<BadgeDto> userBadges = Arrays.asList(
                createMockBadgeDto("Social Butterfly", "🦋", true)
            );
            when(badgeService.getEarnedBadges(any(User.class))).thenReturn(userBadges);

            mockMvc.perform(get("/api/badges/user/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));
        }
    }

    private User createMockUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setDisplayName("Test User");
        return user;
    }

    private BadgeDto createMockBadgeDto(String name, String emoji, boolean earned) {
        return BadgeDto.builder()
                .id(UUID.randomUUID())
                .name(name)
                .emoji(emoji)
                .description("Test badge description")
                .earned(earned)
                .build();
    }

    private BadgeDto.NewBadgeNotification createMockBadgeNotification(String name, String emoji) {
        return BadgeDto.NewBadgeNotification.builder()
                .name(name)
                .emoji(emoji)
                .description("You earned a new badge!")
                .build();
    }
}

