package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bug_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BugReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BugCategory category = BugCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BugStatus status = BugStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BugPriority priority = BugPriority.MEDIUM;

    // Browser/device info captured from frontend
    private String browserInfo;
    
    // URL where the bug was encountered
    private String pageUrl;

    // Admin notes
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public enum BugCategory {
        UI_ISSUE, PERFORMANCE, CRASH, FEATURE_REQUEST, LOGIN_ISSUE, MATCHING, CHAT, SESSIONS, OTHER
    }

    public enum BugStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, WONT_FIX
    }

    public enum BugPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}

