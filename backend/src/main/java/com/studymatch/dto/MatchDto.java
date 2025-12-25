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
public class MatchDto {
    private UUID id;
    private UserWithProfile user;
    private Integer compatibilityScore;
    private String matchReason;
    private String status;
    private LocalDateTime createdAt;
    
    // AI-enhanced fields
    private Boolean aiEnhanced;
    private List<String> studyRecommendations;
    private Double semanticSimilarity;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserWithProfile {
        private UUID id;
        private String username;
        private String displayName;
        private String email;
        private Boolean isOnline;
        private Boolean deleted;
        private ProfileDto profile;
    }
}

