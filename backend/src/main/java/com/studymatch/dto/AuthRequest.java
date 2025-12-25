package com.studymatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank(message = "Display name is required")
        @Size(min = 2, max = 50, message = "Display name must be 2-50 characters")
        private String displayName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        // Optional profile data collected during registration
        private List<String> subjects;
        private List<String> preferredTimes;
        private String examGoal;
        private String learningStyle;
        private String bio;
    }

    @Data
    public static class Login {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class RefreshToken {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }
}

