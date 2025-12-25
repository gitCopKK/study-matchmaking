package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.ProfileDto;
import com.studymatch.service.AdminService;
import com.studymatch.service.ProfileService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Profile Controller Tests")
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private AdminService adminService;

    @Nested
    @DisplayName("GET /api/profiles/me")
    class GetMyProfileTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return current user profile")
        void shouldReturnCurrentUserProfile() throws Exception {
            ProfileDto profile = createMockProfileDto();
            when(profileService.getMyProfile()).thenReturn(profile);

            mockMvc.perform(get("/api/profiles/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bio").value("Test bio"))
                    .andExpect(jsonPath("$.subjects").isArray());
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/profiles/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/profiles/me")
    class UpdateMyProfileTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should update profile successfully")
        void shouldUpdateProfileSuccessfully() throws Exception {
            ProfileDto.UpdateRequest request = new ProfileDto.UpdateRequest();
            request.setBio("Updated bio");
            request.setSubjects(Arrays.asList("Math", "Physics"));
            request.setExamGoal("Exam prep");
            request.setLearningStyle("Visual");

            ProfileDto updatedProfile = createMockProfileDto();
            when(profileService.updateMyProfile(any(ProfileDto.UpdateRequest.class))).thenReturn(updatedProfile);

            mockMvc.perform(put("/api/profiles/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bio").value("Test bio"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should update daily and weekly goals")
        void shouldUpdateStudyGoals() throws Exception {
            ProfileDto.UpdateRequest request = new ProfileDto.UpdateRequest();
            request.setDailyGoalMinutes(90);
            request.setWeeklyGoalMinutes(600);

            ProfileDto updatedProfile = createMockProfileDto();
            updatedProfile.setDailyGoalMinutes(90);
            updatedProfile.setWeeklyGoalMinutes(600);
            when(profileService.updateMyProfile(any(ProfileDto.UpdateRequest.class))).thenReturn(updatedProfile);

            mockMvc.perform(put("/api/profiles/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.dailyGoalMinutes").value(90))
                    .andExpect(jsonPath("$.weeklyGoalMinutes").value(600));
        }
    }

    @Nested
    @DisplayName("GET /api/profiles/{userId}")
    class GetProfileByUserIdTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return profile by user ID")
        void shouldReturnProfileByUserId() throws Exception {
            UUID userId = UUID.randomUUID();
            ProfileDto profile = createMockProfileDto();
            when(profileService.getProfileByUserId(userId)).thenReturn(profile);

            mockMvc.perform(get("/api/profiles/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bio").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/profiles/options")
    class GetProfileOptionsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return profile options")
        void shouldReturnProfileOptions() throws Exception {
            Map<String, List<String>> options = new HashMap<>();
            options.put("subjects", Arrays.asList("Math", "Physics", "Chemistry"));
            options.put("studyGoals", Arrays.asList("Exam prep", "Skill building", "Homework help"));
            when(adminService.getProfileOptions()).thenReturn(options);

            mockMvc.perform(get("/api/profiles/options"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.subjects").isArray())
                    .andExpect(jsonPath("$.studyGoals").isArray());
        }
    }

    private ProfileDto createMockProfileDto() {
        return ProfileDto.builder()
                .id(UUID.randomUUID())
                .bio("Test bio")
                .subjects(Arrays.asList("Math", "Physics"))
                .examGoal("Exam prep")
                .learningStyle("Visual")
                .dailyGoalMinutes(60)
                .weeklyGoalMinutes(300)
                .build();
    }
}

