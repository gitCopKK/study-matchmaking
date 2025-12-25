package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "study_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private User partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private StudyGroup studyGroup;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Builder.Default
    private Integer durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.SCHEDULED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum SessionStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}

