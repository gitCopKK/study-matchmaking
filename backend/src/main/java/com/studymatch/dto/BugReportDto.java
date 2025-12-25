package com.studymatch.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BugReportDto {
    private UUID id;
    private String reporterName;
    private String reporterEmail;
    private UUID reporterId;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;
    private String browserInfo;
    private String pageUrl;
    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}

