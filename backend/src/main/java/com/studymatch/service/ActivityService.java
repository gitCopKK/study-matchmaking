package com.studymatch.service;

import com.studymatch.dto.ActivityDto;
import com.studymatch.dto.BadgeDto;
import com.studymatch.model.Activity;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.ActivityRepository;
import com.studymatch.repository.MatchRepository;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ProfileRepository profileRepository;
    private final StudySessionRepository sessionRepository;
    private final MatchRepository matchRepository;
    private final UserService userService;
    private final BadgeService badgeService;

    public List<ActivityDto> getActivities(LocalDate startDate, LocalDate endDate) {
        User currentUser = userService.getCurrentUser();
        List<Activity> activities = activityRepository.findByUserIdAndDateRange(
            currentUser.getId(), startDate, endDate
        );
        return activities.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ActivityDto logActivity(ActivityDto.CreateRequest request) {
        User currentUser = userService.getCurrentUser();
        LocalDate date = request.getActivityDate() != null ? request.getActivityDate() : LocalDate.now();

        // Validate date is not in the future and not more than 30 days in the past
        LocalDate today = LocalDate.now();
        if (date.isAfter(today)) {
            throw new IllegalArgumentException("Cannot log activity for future dates");
        }
        if (date.isBefore(today.minusDays(30))) {
            throw new IllegalArgumentException("Cannot log activity for dates more than 30 days ago");
        }

        // Calculate study minutes from start/end time if provided
        int studyMinutes;
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        
        if (startTime != null && endTime != null) {
            // Time range mode
            if (endTime.isBefore(startTime)) {
                throw new IllegalArgumentException("End time must be after start time");
            }
            studyMinutes = (int) ChronoUnit.MINUTES.between(startTime, endTime);
        } else {
            // Duration mode
            studyMinutes = request.getStudyMinutes() != null ? request.getStudyMinutes() : 0;
        }

        if (studyMinutes <= 0) {
            throw new IllegalArgumentException("Study time must be greater than 0");
        }
        if (studyMinutes > 720) { // Max 12 hours
            throw new IllegalArgumentException("Study time cannot exceed 12 hours");
        }

        Activity activity = activityRepository.findByUserIdAndActivityDate(currentUser.getId(), date)
            .orElseGet(() -> Activity.builder()
                .user(currentUser)
                .activityDate(date)
                .studyMinutes(0)
                .build());

        activity.setStudyMinutes(activity.getStudyMinutes() + studyMinutes);
        
        // Store time range if provided
        if (startTime != null && endTime != null) {
            activity.setStartTime(startTime);
            activity.setEndTime(endTime);
        }
        
        if (request.getTopicsStudied() != null) {
            activity.setTopicsStudied(request.getTopicsStudied());
        }
        if (request.getNotes() != null) {
            activity.setNotes(request.getNotes());
        }

        activity = activityRepository.save(activity);

        // Update streak
        updateStreak(currentUser);

        // Check and award badges
        badgeService.checkAndAwardBadges(currentUser);

        return toDto(activity);
    }

    public ActivityDto.Stats getStats() {
        User currentUser = userService.getCurrentUser();
        LocalDate today = LocalDate.now();
        
        // Week starts on Sunday (for weekly reset)
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate weekAgo = today.minusDays(7);

        // Total minutes this week (last 7 days for dashboard)
        Integer totalMinutes = activityRepository.sumStudyMinutes(
            currentUser.getId(), weekAgo, today
        );
        Integer daysActive = activityRepository.countActiveDays(currentUser.getId());

        Profile profile = profileRepository.findByUser(currentUser).orElse(null);
        int streak = profile != null && profile.getStudyStreak() != null ? profile.getStudyStreak() : 0;
        int dailyGoal = profile != null && profile.getDailyGoalMinutes() != null ? profile.getDailyGoalMinutes() : 60;
        int weeklyGoal = profile != null && profile.getWeeklyGoalMinutes() != null ? profile.getWeeklyGoalMinutes() : 300;

        // Count sessions scheduled within the past week to next week
        LocalDateTime weekStartTime = weekAgo.atStartOfDay();
        LocalDateTime weekEndTime = today.plusDays(7).atTime(23, 59, 59);
        Integer sessionsThisWeek = sessionRepository.countSessionsInRange(
            currentUser.getId(), weekStartTime, weekEndTime
        );

        // Count mutual matches (friends)
        int friendsCount = matchRepository.findMutualMatches(currentUser.getId()).size();

        // Today's minutes
        Integer todayMinutes = activityRepository.sumStudyMinutes(currentUser.getId(), today, today);
        
        // This week's minutes (Sunday to now)
        Integer weekMinutes = activityRepository.sumStudyMinutes(currentUser.getId(), weekStart, today);

        // Check if studied today
        boolean studiedToday = activityRepository.findByUserIdAndActivityDate(currentUser.getId(), today).isPresent();
        
        // Streak is at risk if:
        // 1. User has a streak > 0
        // 2. User hasn't studied today
        // 3. Current time is after 8 PM
        boolean streakAtRisk = streak > 0 && !studiedToday && LocalTime.now().isAfter(LocalTime.of(20, 0));

        return ActivityDto.Stats.builder()
            .streak(streak)
            .totalMinutes(totalMinutes != null ? totalMinutes : 0)
            .daysActive(daysActive != null ? daysActive : 0)
            .sessionsThisWeek(sessionsThisWeek != null ? sessionsThisWeek : 0)
            .friendsCount(friendsCount)
            .dailyGoalMinutes(dailyGoal)
            .weeklyGoalMinutes(weeklyGoal)
            .todayMinutes(todayMinutes != null ? todayMinutes : 0)
            .weekMinutes(weekMinutes != null ? weekMinutes : 0)
            .streakAtRisk(streakAtRisk)
            .studiedToday(studiedToday)
            .build();
    }

    @Transactional
    public void updateStreak(User user) {
        Profile profile = profileRepository.findByUser(user).orElse(null);
        if (profile == null) return;

        List<Activity> recentActivities = activityRepository.findRecentActivities(user.getId());
        
        if (recentActivities.isEmpty()) {
            profile.setStudyStreak(0);
            profileRepository.save(profile);
            return;
        }
        
        // Get unique dates sorted descending (most recent first)
        List<LocalDate> activeDates = recentActivities.stream()
            .map(Activity::getActivityDate)
            .distinct()
            .sorted((d1, d2) -> d2.compareTo(d1))
            .toList();
        
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        
        // Streak only counts if user studied today or yesterday
        LocalDate firstActiveDate = activeDates.get(0);
        if (!firstActiveDate.equals(today) && !firstActiveDate.equals(yesterday)) {
            profile.setStudyStreak(0);
            profileRepository.save(profile);
            return;
        }
        
        // Count consecutive days starting from the most recent active date
        int streak = 1;
        LocalDate expectedDate = firstActiveDate.minusDays(1);
        
        for (int i = 1; i < activeDates.size(); i++) {
            LocalDate currentDate = activeDates.get(i);
            if (currentDate.equals(expectedDate)) {
                streak++;
                expectedDate = currentDate.minusDays(1);
            } else {
                break;
            }
        }

        profile.setStudyStreak(streak);
        profileRepository.save(profile);
    }

    // Daily streak update job - resets streaks for users who didn't study
    @Scheduled(cron = "0 0 0 * * *") // Midnight every day
    @Transactional
    public void dailyStreakUpdate() {
        // This could reset streaks for users who didn't study yesterday
        // For simplicity, streaks are calculated on-the-fly
    }

    private ActivityDto toDto(Activity activity) {
        return ActivityDto.builder()
            .id(activity.getId())
            .activityDate(activity.getActivityDate())
            .studyMinutes(activity.getStudyMinutes())
            .startTime(activity.getStartTime())
            .endTime(activity.getEndTime())
            .topicsStudied(activity.getTopicsStudied())
            .notes(activity.getNotes())
            .build();
    }
}
