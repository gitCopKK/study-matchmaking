package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.AuthResponse;
import com.studymatch.dto.UserSearchDto;
import com.studymatch.service.UserService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("User Controller Tests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Nested
    @DisplayName("GET /api/users/me")
    class GetCurrentUserTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return current user when authenticated")
        void shouldReturnCurrentUser() throws Exception {
            AuthResponse.UserDto userDto = createMockUserDto();
            when(userService.getCurrentUserDto()).thenReturn(userDto);

            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("test@example.com"))
                    .andExpect(jsonPath("$.displayName").value("Test User"));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/users/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/users/me")
    class UpdateUserTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should update user display name")
        void shouldUpdateUserDisplayName() throws Exception {
            Map<String, String> updates = new HashMap<>();
            updates.put("displayName", "New Name");

            AuthResponse.UserDto updatedUser = createMockUserDto();
            updatedUser.setDisplayName("New Name");
            when(userService.updateUser(anyString())).thenReturn(updatedUser);

            mockMvc.perform(put("/api/users/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.displayName").value("New Name"));
        }
    }

    @Nested
    @DisplayName("POST /api/users/change-password")
    class ChangePasswordTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should change password successfully")
        void shouldChangePasswordSuccessfully() throws Exception {
            Map<String, String> request = new HashMap<>();
            request.put("currentPassword", "oldPassword123");
            request.put("newPassword", "newPassword123");

            doNothing().when(userService).changePassword(anyString(), anyString());

            mockMvc.perform(post("/api/users/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password changed successfully"));
        }
    }

    @Nested
    @DisplayName("GET /api/users/search")
    class SearchUsersTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should search users by query")
        void shouldSearchUsers() throws Exception {
            List<UserSearchDto> results = Arrays.asList(
                createMockUserSearchDto("user1@example.com", "User One"),
                createMockUserSearchDto("user2@example.com", "User Two")
            );
            when(userService.searchUsers(anyString())).thenReturn(results);

            mockMvc.perform(get("/api/users/search")
                    .param("query", "user"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list for no matches")
        void shouldReturnEmptyListForNoMatches() throws Exception {
            when(userService.searchUsers(anyString())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/users/search")
                    .param("query", "nonexistent"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("DELETE /api/users/me")
    class DeleteAccountTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should delete account successfully")
        void shouldDeleteAccountSuccessfully() throws Exception {
            doNothing().when(userService).deleteAccount();

            mockMvc.perform(delete("/api/users/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Account deleted successfully"));
        }
    }

    private AuthResponse.UserDto createMockUserDto() {
        AuthResponse.UserDto userDto = new AuthResponse.UserDto();
        userDto.setId(UUID.randomUUID());
        userDto.setEmail("test@example.com");
        userDto.setDisplayName("Test User");
        userDto.setRole("USER");
        return userDto;
    }

    private UserSearchDto createMockUserSearchDto(String email, String displayName) {
        UserSearchDto dto = new UserSearchDto();
        dto.setId(UUID.randomUUID());
        dto.setEmail(email);
        dto.setDisplayName(displayName);
        return dto;
    }
}

