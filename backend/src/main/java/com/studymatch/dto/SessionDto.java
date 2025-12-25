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
public class SessionDto {
    private UUID id;
    private String title;
    private PartnerDto creator;
    private PartnerDto partner;
    private GroupDto group;
    private List<PartnerDto> participants;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String status;
    private LocalDateTime createdAt;
    private boolean isGroupSession;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PartnerDto {
        private UUID id;
        private String displayName;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GroupDto {
        private UUID id;
        private String name;
        private Integer memberCount;
    }

    @Data
    public static class CreateRequest {
        private String title;
        private UUID partnerId;
        private UUID groupId;
        private LocalDateTime scheduledAt;
        private Integer durationMinutes;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private LocalDateTime scheduledAt;
        private Integer durationMinutes;
        private String status;
    }
}

