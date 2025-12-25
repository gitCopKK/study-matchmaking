package com.studymatch.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate activityDate;

    @Builder.Default
    private Integer studyMinutes = 0;

    // Optional: Start and end time for time-range logging
    private LocalTime startTime;
    private LocalTime endTime;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> topicsStudied;

    // Optional notes about the study session
    @Column(columnDefinition = "TEXT")
    private String notes;
}
