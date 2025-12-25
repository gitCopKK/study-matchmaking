package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private UUID id;
    private String type;
    private String message;
    private String link;
    private Boolean read;
    private LocalDateTime createdAt;
}

