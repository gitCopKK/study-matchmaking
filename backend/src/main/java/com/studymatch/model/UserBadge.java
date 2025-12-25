package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "badge_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(nullable = false)
    private LocalDateTime earnedAt;

    // Flag to show if user has seen the "badge earned" notification
    @Builder.Default
    private Boolean seen = false;
}

