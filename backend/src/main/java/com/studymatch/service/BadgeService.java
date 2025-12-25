package com.studymatch.service;

import com.studymatch.dto.BadgeDto;
import com.studymatch.model.*;
import com.studymatch.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityRepository activityRepository;
    private final ProfileRepository profileRepository;
    private final MatchRepository matchRepository;
    private final StudySessionRepository sessionRepository;

    // Badge definitions
    private static final List<BadgeDefinition> BADGE_DEFINITIONS = Arrays.asList(
        // Streak Badges
        new BadgeDefinition("first_step", "First Step", "🌱", "Log your first study session", "STREAK", 1, 1),
        new BadgeDefinition("streak_3", "Getting Started", "✨", "Achieve a 3-day study streak", "STREAK", 3, 2),
        new BadgeDefinition("streak_7", "Week Warrior", "🔥", "Achieve a 7-day study streak", "STREAK", 7, 3),
        new BadgeDefinition("streak_14", "Fortnight Fighter", "💪", "Achieve a 14-day study streak", "STREAK", 14, 4),
        new BadgeDefinition("streak_30", "Monthly Master", "⚡", "Achieve a 30-day study streak", "STREAK", 30, 5),
        new BadgeDefinition("streak_100", "Centurion", "👑", "Achieve a 100-day study streak", "STREAK", 100, 6),
        
        // Hours Badges
        new BadgeDefinition("hours_10", "Dedicated Learner", "📖", "Study for 10 total hours", "HOURS", 600, 10),
        new BadgeDefinition("hours_50", "Committed Student", "📚", "Study for 50 total hours", "HOURS", 3000, 11),
        new BadgeDefinition("hours_100", "Century Club", "💯", "Study for 100 total hours", "HOURS", 6000, 12),
        new BadgeDefinition("hours_500", "Scholar", "🎓", "Study for 500 total hours", "HOURS", 30000, 13),
        
        // Social Badges
        new BadgeDefinition("first_partner", "Team Player", "🤝", "Connect with your first study partner", "SOCIAL", 1, 20),
        new BadgeDefinition("partners_5", "Social Learner", "👥", "Connect with 5 study partners", "SOCIAL", 5, 21),
        new BadgeDefinition("partners_10", "Networking Pro", "🌟", "Connect with 10 study partners", "SOCIAL", 10, 22),
        
        // Session Badges
        new BadgeDefinition("first_session", "Session Starter", "📅", "Complete your first study session", "SESSION", 1, 30),
        new BadgeDefinition("sessions_10", "Session Regular", "🎯", "Complete 10 study sessions", "SESSION", 10, 31),
        new BadgeDefinition("sessions_50", "Session Master", "🏆", "Complete 50 study sessions", "SESSION", 50, 32),
        
        // Consistency Badges
        new BadgeDefinition("early_bird", "Early Bird", "🌅", "Log 5 study sessions before 8 AM", "CONSISTENCY", 5, 40),
        new BadgeDefinition("night_owl", "Night Owl", "🦉", "Log 5 study sessions after 10 PM", "CONSISTENCY", 5, 41),
        new BadgeDefinition("weekend_warrior", "Weekend Warrior", "🎉", "Study on 10 weekend days", "CONSISTENCY", 10, 42)
    );

    @PostConstruct
    @Transactional
    public void initializeBadges() {
        for (BadgeDefinition def : BADGE_DEFINITIONS) {
            if (!badgeRepository.existsByCode(def.code)) {
                Badge badge = Badge.builder()
                    .code(def.code)
                    .name(def.name)
                    .emoji(def.emoji)
                    .description(def.description)
                    .category(def.category)
                    .threshold(def.threshold)
                    .displayOrder(def.displayOrder)
                    .build();
                badgeRepository.save(badge);
                log.info("Created badge: {}", def.code);
            }
        }
    }

    public BadgeDto.BadgeListResponse getBadges(User user) {
        List<Badge> allBadges = badgeRepository.findAllByOrderByDisplayOrderAsc();
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(user.getId());
        Set<UUID> earnedBadgeIds = userBadges.stream()
            .map(ub -> ub.getBadge().getId())
            .collect(Collectors.toSet());

        Map<String, Integer> progressMap = calculateProgress(user);

        List<BadgeDto> earnedBadges = userBadges.stream()
            .map(ub -> toBadgeDto(ub.getBadge(), ub.getEarnedAt(), true, progressMap))
            .collect(Collectors.toList());

        List<BadgeDto> availableBadges = allBadges.stream()
            .filter(b -> !earnedBadgeIds.contains(b.getId()))
            .map(b -> toBadgeDto(b, null, false, progressMap))
            .collect(Collectors.toList());

        return BadgeDto.BadgeListResponse.builder()
            .earnedBadges(earnedBadges)
            .availableBadges(availableBadges)
            .totalEarned(earnedBadges.size())
            .totalAvailable(allBadges.size())
            .build();
    }

    public List<BadgeDto> getEarnedBadges(User user) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(user.getId());
        Map<String, Integer> progressMap = calculateProgress(user);
        
        return userBadges.stream()
            .map(ub -> toBadgeDto(ub.getBadge(), ub.getEarnedAt(), true, progressMap))
            .collect(Collectors.toList());
    }

    public List<BadgeDto.NewBadgeNotification> getUnseenBadges(User user) {
        List<UserBadge> unseenBadges = userBadgeRepository.findUnseenBadges(user.getId());
        return unseenBadges.stream()
            .map(ub -> BadgeDto.NewBadgeNotification.builder()
                .id(ub.getBadge().getId())
                .code(ub.getBadge().getCode())
                .name(ub.getBadge().getName())
                .emoji(ub.getBadge().getEmoji())
                .description(ub.getBadge().getDescription())
                .earnedAt(ub.getEarnedAt())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public void markBadgesAsSeen(User user) {
        List<UserBadge> unseenBadges = userBadgeRepository.findUnseenBadges(user.getId());
        for (UserBadge ub : unseenBadges) {
            ub.setSeen(true);
            userBadgeRepository.save(ub);
        }
    }

    @Transactional
    public List<BadgeDto.NewBadgeNotification> checkAndAwardBadges(User user) {
        List<BadgeDto.NewBadgeNotification> newBadges = new ArrayList<>();
        Map<String, Integer> progress = calculateProgress(user);
        List<Badge> allBadges = badgeRepository.findAllByOrderByDisplayOrderAsc();

        for (Badge badge : allBadges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
                continue; // Already earned
            }

            Integer currentProgress = progress.getOrDefault(badge.getCategory(), 0);
            if (currentProgress >= badge.getThreshold()) {
                UserBadge userBadge = UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .earnedAt(LocalDateTime.now())
                    .seen(false)
                    .build();
                userBadgeRepository.save(userBadge);

                newBadges.add(BadgeDto.NewBadgeNotification.builder()
                    .id(badge.getId())
                    .code(badge.getCode())
                    .name(badge.getName())
                    .emoji(badge.getEmoji())
                    .description(badge.getDescription())
                    .earnedAt(userBadge.getEarnedAt())
                    .build());

                log.info("User {} earned badge: {}", user.getEmail(), badge.getCode());
            }
        }

        return newBadges;
    }

    private Map<String, Integer> calculateProgress(User user) {
        Map<String, Integer> progress = new HashMap<>();

        // Get profile for streak
        Profile profile = profileRepository.findByUser(user).orElse(null);
        int streak = profile != null && profile.getStudyStreak() != null ? profile.getStudyStreak() : 0;
        progress.put("STREAK", streak);

        // Total study minutes (all time)
        LocalDate farPast = LocalDate.of(2020, 1, 1);
        LocalDate today = LocalDate.now();
        Integer totalMinutes = activityRepository.sumStudyMinutes(user.getId(), farPast, today);
        progress.put("HOURS", totalMinutes != null ? totalMinutes : 0);

        // Count partners (mutual matches)
        int partnerCount = matchRepository.findMutualMatches(user.getId()).size();
        progress.put("SOCIAL", partnerCount);

        // Count completed sessions
        int sessionCount = sessionRepository.countCompletedSessionsByUserId(user.getId());
        progress.put("SESSION", sessionCount);

        // Early bird sessions (before 8 AM)
        int earlyBirdCount = countEarlyBirdSessions(user.getId());
        progress.put("EARLY_BIRD", earlyBirdCount);

        // Night owl sessions (after 10 PM)
        int nightOwlCount = countNightOwlSessions(user.getId());
        progress.put("NIGHT_OWL", nightOwlCount);

        // Weekend study days
        int weekendDays = countWeekendStudyDays(user.getId());
        progress.put("WEEKEND", weekendDays);

        // Consistency (for badges with special criteria)
        progress.put("CONSISTENCY", Math.max(earlyBirdCount, Math.max(nightOwlCount, weekendDays)));

        return progress;
    }

    private int countEarlyBirdSessions(UUID userId) {
        List<Activity> activities = activityRepository.findRecentActivities(userId);
        return (int) activities.stream()
            .filter(a -> a.getStartTime() != null && a.getStartTime().isBefore(LocalTime.of(8, 0)))
            .count();
    }

    private int countNightOwlSessions(UUID userId) {
        List<Activity> activities = activityRepository.findRecentActivities(userId);
        return (int) activities.stream()
            .filter(a -> a.getStartTime() != null && a.getStartTime().isAfter(LocalTime.of(22, 0)))
            .count();
    }

    private int countWeekendStudyDays(UUID userId) {
        List<Activity> activities = activityRepository.findRecentActivities(userId);
        return (int) activities.stream()
            .filter(a -> {
                int dayOfWeek = a.getActivityDate().getDayOfWeek().getValue();
                return dayOfWeek == 6 || dayOfWeek == 7; // Saturday or Sunday
            })
            .map(Activity::getActivityDate)
            .distinct()
            .count();
    }

    private BadgeDto toBadgeDto(Badge badge, LocalDateTime earnedAt, boolean earned, Map<String, Integer> progress) {
        Integer currentProgress = 0;
        Integer progressPercentage = 0;

        if (!earned) {
            currentProgress = progress.getOrDefault(badge.getCategory(), 0);
            progressPercentage = Math.min(100, (int) ((currentProgress * 100.0) / badge.getThreshold()));
        }

        return BadgeDto.builder()
            .id(badge.getId())
            .code(badge.getCode())
            .name(badge.getName())
            .emoji(badge.getEmoji())
            .description(badge.getDescription())
            .category(badge.getCategory())
            .threshold(badge.getThreshold())
            .displayOrder(badge.getDisplayOrder())
            .earnedAt(earnedAt)
            .earned(earned)
            .currentProgress(currentProgress)
            .progressPercentage(progressPercentage)
            .build();
    }

    // Helper record for badge definitions
    private record BadgeDefinition(String code, String name, String emoji, String description, 
                                   String category, int threshold, int displayOrder) {}
}

