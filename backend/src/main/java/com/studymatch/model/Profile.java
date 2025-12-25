package com.studymatch.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> subjects;

    private String examGoal;

    private String learningStyle;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> preferredTimes;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> strengths;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> weaknesses;

    @Builder.Default
    private Integer studyStreak = 0;

    @Builder.Default
    private Integer compatibilityWeight = 50;

    // Study Goals - user-configurable
    @Builder.Default
    private Integer dailyGoalMinutes = 60; // Default: 1 hour/day

    @Builder.Default
    private Integer weeklyGoalMinutes = 300; // Default: 5 hours/week
}
