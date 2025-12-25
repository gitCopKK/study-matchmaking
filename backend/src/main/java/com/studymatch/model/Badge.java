package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code; // Unique identifier like "streak_7", "hours_100"

    @Column(nullable = false)
    private String name; // Display name like "Week Warrior"

    @Column(nullable = false)
    private String emoji; // Emoji icon like "🔥"

    @Column(columnDefinition = "TEXT")
    private String description; // How to earn this badge

    @Column(nullable = false)
    private String category; // STREAK, HOURS, SOCIAL, CONSISTENCY, MILESTONE

    @Column(nullable = false)
    private Integer threshold; // The value needed to earn (e.g., 7 for 7-day streak)

    @Builder.Default
    private Integer displayOrder = 0; // Order for display purposes
}

