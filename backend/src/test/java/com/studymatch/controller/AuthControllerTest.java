package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.AuthRequest;
import com.studymatch.dto.AuthResponse;
import com.studymatch.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Auth Controller Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Should register user successfully with valid data")
        void shouldRegisterUserSuccessfully() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register();
            request.setEmail("test@example.com");
            request.setPassword("password123");
            request.setDisplayName("Test User");

            AuthResponse response = createMockAuthResponse();
            when(authService.register(any(AuthRequest.Register.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.user.email").value("test@example.com"));
        }

        @Test
        @DisplayName("Should fail registration with invalid email")
        void shouldFailRegistrationWithInvalidEmail() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register();
            request.setEmail("invalid-email");
            request.setPassword("password123");
            request.setDisplayName("Test User");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail registration with empty password")
        void shouldFailRegistrationWithEmptyPassword() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register();
            request.setEmail("test@example.com");
            request.setPassword("");
            request.setDisplayName("Test User");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail registration with missing display name")
        void shouldFailRegistrationWithMissingDisplayName() throws Exception {
            AuthRequest.Register request = new AuthRequest.Register();
            request.setEmail("test@example.com");
            request.setPassword("password123");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Should login user successfully with valid credentials")
        void shouldLoginUserSuccessfully() throws Exception {
            AuthRequest.Login request = new AuthRequest.Login();
            request.setUsername("test@example.com");
            request.setPassword("password123");

            AuthResponse response = createMockAuthResponse();
            when(authService.login(any(AuthRequest.Login.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.refreshToken").exists());
        }

        @Test
        @DisplayName("Should fail login with empty username")
        void shouldFailLoginWithEmptyUsername() throws Exception {
            AuthRequest.Login request = new AuthRequest.Login();
            request.setUsername("");
            request.setPassword("password123");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail login with empty password")
        void shouldFailLoginWithEmptyPassword() throws Exception {
            AuthRequest.Login request = new AuthRequest.Login();
            request.setUsername("test@example.com");
            request.setPassword("");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token successfully")
        void shouldRefreshTokenSuccessfully() throws Exception {
            AuthRequest.RefreshToken request = new AuthRequest.RefreshToken();
            request.setRefreshToken("valid-refresh-token");

            AuthResponse response = createMockAuthResponse();
            when(authService.refresh(any(AuthRequest.RefreshToken.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/refresh")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                    .andExpect(status().isOk());
        }
    }

    private AuthResponse createMockAuthResponse() {
        AuthResponse.UserDto userDto = new AuthResponse.UserDto();
        userDto.setId(UUID.randomUUID());
        userDto.setEmail("test@example.com");
        userDto.setDisplayName("Test User");
        userDto.setRole("USER");

        AuthResponse response = new AuthResponse();
        response.setToken("mock-jwt-token");
        response.setRefreshToken("mock-refresh-token");
        response.setUser(userDto);
        return response;
    }
}

