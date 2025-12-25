package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BadgeDto {
    private UUID id;
    private String code;
    private String name;
    private String emoji;
    private String description;
    private String category;
    private Integer threshold;
    private Integer displayOrder;
    
    // For user's earned badges
    private LocalDateTime earnedAt;
    private Boolean earned;
    
    // Progress towards badge (for unearned badges)
    private Integer currentProgress;
    private Integer progressPercentage;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BadgeListResponse {
        private List<BadgeDto> earnedBadges;
        private List<BadgeDto> availableBadges;
        private Integer totalEarned;
        private Integer totalAvailable;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NewBadgeNotification {
        private UUID id;
        private String code;
        private String name;
        private String emoji;
        private String description;
        private LocalDateTime earnedAt;
    }
}

