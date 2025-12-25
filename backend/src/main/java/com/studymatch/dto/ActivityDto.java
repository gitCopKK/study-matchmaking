package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDto {
    private UUID id;
    private LocalDate activityDate;
    private Integer studyMinutes;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<String> topicsStudied;
    private String notes;

    @Data
    public static class CreateRequest {
        private LocalDate activityDate;
        private Integer studyMinutes; // Used if logging by duration
        private LocalTime startTime;  // Used if logging by time range
        private LocalTime endTime;    // Used if logging by time range
        private List<String> topicsStudied;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Stats {
        private Integer streak;
        private Integer totalMinutes;
        private Integer daysActive;
        private Integer sessionsThisWeek;
        private Integer friendsCount;
        
        // Goal tracking
        private Integer dailyGoalMinutes;
        private Integer weeklyGoalMinutes;
        private Integer todayMinutes;
        private Integer weekMinutes;
        
        // Streak warning
        private Boolean streakAtRisk;
        private Boolean studiedToday;
    }
}
