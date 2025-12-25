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
public class LeaderboardDto {
    
    private List<LeaderboardEntry> topStreaks;
    private List<LeaderboardEntry> topStudyHours;
    private List<LeaderboardEntry> mostDaysActive;
    private List<LeaderboardEntry> mostSessionsCompleted;
    private List<LeaderboardEntry> mostStudyPartners;
    private List<LeaderboardEntry> risingStars;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeaderboardEntry {
        private UUID userId;
        private String displayName;
        private Integer rank;
        private Integer value;
        private Double percentageValue; // For rising stars improvement percentage
        private String label; // Custom label like "7 days", "12 hours", etc.
        private List<String> subjects; // Optional: show user's subjects
    }
}

