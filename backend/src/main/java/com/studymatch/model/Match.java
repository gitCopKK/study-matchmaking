package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(nullable = false)
    private Integer compatibilityScore;

    @Column(columnDefinition = "TEXT")
    private String matchReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MatchStatus status = MatchStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unmatched_by_id")
    private User unmatchedBy;

    @Column(name = "declined_at")
    private LocalDateTime declinedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum MatchStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        MUTUAL,
        UNMATCHED
    }
}

