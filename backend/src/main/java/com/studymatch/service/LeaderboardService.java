package com.studymatch.service;

import com.studymatch.dto.LeaderboardDto;
import com.studymatch.dto.LeaderboardDto.LeaderboardEntry;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final ProfileRepository profileRepository;
    private final ActivityRepository activityRepository;
    private final StudySessionRepository studySessionRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    private static final int LEADERBOARD_LIMIT = 10;

    public LeaderboardDto getLeaderboard() {
        return LeaderboardDto.builder()
                .topStreaks(getTopStreaks())
                .topStudyHours(getTopStudyHours())
                .mostDaysActive(getMostDaysActive())
                .mostSessionsCompleted(getMostSessionsCompleted())
                .mostStudyPartners(getMostStudyPartners())
                .risingStars(getRisingStars())
                .build();
    }

    /**
     * Get users with the highest study streaks
     */
    private List<LeaderboardEntry> getTopStreaks() {
        List<Profile> profiles = profileRepository.findTopStreaks(PageRequest.of(0, LEADERBOARD_LIMIT));
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Profile profile : profiles) {
            User user = profile.getUser();
            if (user != null && profile.getStudyStreak() != null && profile.getStudyStreak() > 0) {
                entries.add(LeaderboardEntry.builder()
                        .userId(user.getId())
                        .displayName(user.getDisplayName())
                        .rank(rank++)
                        .value(profile.getStudyStreak())
                        .label(profile.getStudyStreak() + " day" + (profile.getStudyStreak() > 1 ? "s" : ""))
                        .subjects(profile.getSubjects())
                        .build());
            }
        }
        return entries;
    }

    /**
     * Get users with the most study hours this week
     */
    private List<LeaderboardEntry> getTopStudyHours() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);
        
        List<Object[]> results = activityRepository.findTopStudyMinutesThisWeek(startDate, endDate);
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            if (rank > LEADERBOARD_LIMIT) break;
            
            UUID userId = (UUID) row[0];
            Long totalMinutes = ((Number) row[1]).longValue();
            
            if (totalMinutes <= 0) continue;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;
            
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            
            double hours = Math.round(totalMinutes / 60.0 * 10) / 10.0;
            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .displayName(user.getDisplayName())
                    .rank(rank++)
                    .value(totalMinutes.intValue())
                    .label(hours + " hr" + (hours != 1 ? "s" : ""))
                    .subjects(profile != null ? profile.getSubjects() : null)
                    .build());
        }
        return entries;
    }

    /**
     * Get users with the most active study days (all time)
     */
    private List<LeaderboardEntry> getMostDaysActive() {
        List<Object[]> results = activityRepository.findMostDaysActive();
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            if (rank > LEADERBOARD_LIMIT) break;
            
            UUID userId = (UUID) row[0];
            Long daysActive = ((Number) row[1]).longValue();
            
            if (daysActive <= 0) continue;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;
            
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            
            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .displayName(user.getDisplayName())
                    .rank(rank++)
                    .value(daysActive.intValue())
                    .label(daysActive + " day" + (daysActive > 1 ? "s" : ""))
                    .subjects(profile != null ? profile.getSubjects() : null)
                    .build());
        }
        return entries;
    }

    /**
     * Get users with the most completed study sessions
     */
    private List<LeaderboardEntry> getMostSessionsCompleted() {
        List<Object[]> results = studySessionRepository.findMostSessionsCompleted();
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            if (rank > LEADERBOARD_LIMIT) break;
            
            UUID userId = (UUID) row[0];
            Long sessionCount = ((Number) row[1]).longValue();
            
            if (sessionCount <= 0) continue;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;
            
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            
            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .displayName(user.getDisplayName())
                    .rank(rank++)
                    .value(sessionCount.intValue())
                    .label(sessionCount + " session" + (sessionCount > 1 ? "s" : ""))
                    .subjects(profile != null ? profile.getSubjects() : null)
                    .build());
        }
        return entries;
    }

    /**
     * Get users with the most study partners (mutual matches)
     */
    private List<LeaderboardEntry> getMostStudyPartners() {
        List<Object[]> results = matchRepository.findMostStudyPartners();
        
        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : results) {
            if (rank > LEADERBOARD_LIMIT) break;
            
            UUID userId = (UUID) row[0];
            Long partnerCount = ((Number) row[1]).longValue();
            
            if (partnerCount <= 0) continue;
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;
            
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            
            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .displayName(user.getDisplayName())
                    .rank(rank++)
                    .value(partnerCount.intValue())
                    .label(partnerCount + " partner" + (partnerCount > 1 ? "s" : ""))
                    .subjects(profile != null ? profile.getSubjects() : null)
                    .build());
        }
        return entries;
    }

    /**
     * Get rising stars - users who improved the most this week vs last week
     */
    private List<LeaderboardEntry> getRisingStars() {
        LocalDate today = LocalDate.now();
        LocalDate thisWeekStart = today.minusDays(7);
        LocalDate lastWeekStart = today.minusDays(14);
        LocalDate lastWeekEnd = today.minusDays(7);

        // Get study minutes for this week
        List<Object[]> thisWeekResults = activityRepository.findStudyMinutesByDateRange(thisWeekStart, today);
        Map<UUID, Integer> thisWeekMinutes = new HashMap<>();
        for (Object[] row : thisWeekResults) {
            UUID userId = (UUID) row[0];
            Integer minutes = ((Number) row[1]).intValue();
            thisWeekMinutes.put(userId, minutes);
        }

        // Get study minutes for last week
        List<Object[]> lastWeekResults = activityRepository.findStudyMinutesByDateRange(lastWeekStart, lastWeekEnd);
        Map<UUID, Integer> lastWeekMinutes = new HashMap<>();
        for (Object[] row : lastWeekResults) {
            UUID userId = (UUID) row[0];
            Integer minutes = ((Number) row[1]).intValue();
            lastWeekMinutes.put(userId, minutes);
        }

        // Calculate improvement for each user
        List<Map.Entry<UUID, Double>> improvements = new ArrayList<>();
        
        for (UUID userId : thisWeekMinutes.keySet()) {
            int thisWeek = thisWeekMinutes.getOrDefault(userId, 0);
            int lastWeek = lastWeekMinutes.getOrDefault(userId, 0);
            
            // Only include users who have activity in both weeks or significant new activity
            if (thisWeek > 0) {
                double improvement;
                if (lastWeek == 0) {
                    // New active user this week - give them credit based on their minutes
                    improvement = thisWeek; // Use absolute value for completely new users
                } else {
                    // Calculate percentage improvement
                    improvement = ((double) (thisWeek - lastWeek) / lastWeek) * 100;
                }
                
                if (improvement > 0) {
                    improvements.add(new AbstractMap.SimpleEntry<>(userId, improvement));
                }
            }
        }

        // Sort by improvement descending
        improvements.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<LeaderboardEntry> entries = new ArrayList<>();
        int rank = 1;
        for (Map.Entry<UUID, Double> entry : improvements) {
            if (rank > LEADERBOARD_LIMIT) break;
            
            UUID userId = entry.getKey();
            Double improvement = entry.getValue();
            
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) continue;
            
            Profile profile = profileRepository.findByUserId(userId).orElse(null);
            
            int lastWeek = lastWeekMinutes.getOrDefault(userId, 0);
            String label;
            if (lastWeek == 0) {
                // New user
                int thisWeek = thisWeekMinutes.getOrDefault(userId, 0);
                double hours = Math.round(thisWeek / 60.0 * 10) / 10.0;
                label = "New! " + hours + " hrs";
            } else {
                label = "+" + Math.round(improvement) + "% vs last week";
            }
            
            entries.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .displayName(user.getDisplayName())
                    .rank(rank++)
                    .value(thisWeekMinutes.getOrDefault(userId, 0))
                    .percentageValue(improvement)
                    .label(label)
                    .subjects(profile != null ? profile.getSubjects() : null)
                    .build());
        }
        return entries;
    }
}

