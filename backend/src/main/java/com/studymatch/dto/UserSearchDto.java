package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSearchDto {
    private UUID id;
    private String username;
    private String displayName;
    private String email;
    private Boolean isOnline;
    private ProfileDto profile;
    private String matchStatus;  // null, PENDING, ACCEPTED, MUTUAL, DECLINED
    private Integer cooldownDaysRemaining;  // Days until cooldown expires (only set if DECLINED within cooldown period)
}

