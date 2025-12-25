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
public class GroupDto {
    private UUID id;
    private String name;
    private MemberDto createdBy;
    private Integer maxMembers;
    private List<MemberDto> members;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MemberDto {
        private UUID id;
        private String displayName;
        private String role;
    }

    @Data
    public static class CreateRequest {
        private String name;
        private Integer maxMembers;
    }
}

