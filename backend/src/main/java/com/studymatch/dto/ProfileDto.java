package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {
    private UUID id;
    private UUID userId;
    private String displayName;
    private String username;
    private String email;
    private String bio;
    private List<String> subjects;
    private String examGoal;
    private String learningStyle;
    private List<String> preferredTimes;
    private List<String> strengths;
    private List<String> weaknesses;
    private Integer studyStreak;
    
    // Study Goals
    private Integer dailyGoalMinutes;
    private Integer weeklyGoalMinutes;
    
    // Badges summary
    private Integer badgeCount;
    private List<BadgeDto> recentBadges;

    @Data
    public static class UpdateRequest {
        private String bio;
        private List<String> subjects;
        private String examGoal;
        private String learningStyle;
        private List<String> preferredTimes;
        private List<String> strengths;
        private List<String> weaknesses;
        
        // Study Goals
        private Integer dailyGoalMinutes;
        private Integer weeklyGoalMinutes;
    }
}
