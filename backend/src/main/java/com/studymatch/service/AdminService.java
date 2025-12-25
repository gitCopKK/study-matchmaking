package com.studymatch.service;

import com.studymatch.model.AppSettings;
import com.studymatch.model.User;
import com.studymatch.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final StudySessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ActivityRepository activityRepository;
    private final MatchRepository matchRepository;
    private final TokenUsageRepository tokenUsageRepository;
    private final AppSettingsRepository appSettingsRepository;
    private final ObjectMapper objectMapper;
    
    // Default profile options
    private static final List<String> DEFAULT_SUBJECTS = Arrays.asList(
        "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
        "Economics", "History", "Literature", "Psychology", "Engineering",
        "Medicine", "Law", "Business", "Art & Design", "Languages"
    );
    
    private static final List<String> DEFAULT_STUDY_GOALS = Arrays.asList(
        "GRE", "GMAT", "MCAT", "LSAT", "SAT", "ACT", "IELTS", "TOEFL",
        "CPA", "CFA", "University Exams", "Competitive Exams", "Certifications", "Other"
    );
    
    private static final String SUBJECTS_KEY = "profile_options_subjects";
    private static final String STUDY_GOALS_KEY = "profile_options_study_goals";
    
    /**
     * Get comprehensive dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayAgo = now.minusDays(1);
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime monthAgo = now.minusDays(30);
        
        // Filter out deleted users
        List<User> allUsers = userRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
            .collect(Collectors.toList());
        
        // User stats
        long totalUsers = allUsers.size();
        long activeUsersToday = allUsers.stream()
            .filter(u -> u.getLastSeen() != null && u.getLastSeen().isAfter(dayAgo))
            .count();
        long activeUsersWeek = allUsers.stream()
            .filter(u -> u.getLastSeen() != null && u.getLastSeen().isAfter(weekAgo))
            .count();
        long blockedUsers = allUsers.stream()
            .filter(u -> Boolean.TRUE.equals(u.getBlocked()))
            .count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsersThisWeek", activeUsersWeek);
        stats.put("blockedUsers", blockedUsers);
        stats.put("onlineNow", allUsers.stream()
            .filter(u -> Boolean.TRUE.equals(u.getIsOnline())).count());
        
        // DAU/WAU/MAU Analytics
        stats.put("dau", activeUsersToday);  // Daily Active Users
        stats.put("wau", activeUsersWeek);    // Weekly Active Users
        long activeUsersMonth = allUsers.stream()
            .filter(u -> u.getLastSeen() != null && u.getLastSeen().isAfter(monthAgo))
            .count();
        stats.put("mau", activeUsersMonth);   // Monthly Active Users
        
        // DAU/WAU ratio (engagement metric) - higher is better
        double dauWauRatio = activeUsersWeek > 0 ? (double) activeUsersToday / activeUsersWeek * 100 : 0;
        stats.put("dauWauRatio", Math.round(dauWauRatio * 10) / 10.0);
        
        // New users this week
        long newUsersThisWeek = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(weekAgo))
            .count();
        stats.put("newUsersThisWeek", newUsersThisWeek);
        
        // Profile completion rate
        long profilesComplete = allUsers.stream()
            .filter(u -> Boolean.TRUE.equals(u.getProfileComplete()))
            .count();
        double profileCompletionRate = totalUsers > 0 ? (double) profilesComplete / totalUsers * 100 : 0;
        stats.put("profileCompletionRate", Math.round(profileCompletionRate * 10) / 10.0);
        
        // Session stats
        long totalSessions = sessionRepository.count();
        stats.put("totalSessions", totalSessions);
        
        // Message stats
        long totalMessages = messageRepository.count();
        stats.put("totalMessages", totalMessages);
        
        // Average messages per user (engagement metric)
        double avgMessagesPerUser = totalUsers > 0 ? (double) totalMessages / totalUsers : 0;
        stats.put("avgMessagesPerUser", Math.round(avgMessagesPerUser * 10) / 10.0);
        
        // Match stats
        long totalMatches = matchRepository.count();
        long mutualMatches = matchRepository.findAll().stream()
            .filter(m -> m.getStatus().name().equals("MUTUAL"))
            .count();
        stats.put("totalMatches", totalMatches);
        stats.put("mutualMatches", mutualMatches);
        
        // Match success rate
        double matchSuccessRate = totalMatches > 0 ? (double) mutualMatches / totalMatches * 100 : 0;
        stats.put("matchSuccessRate", Math.round(matchSuccessRate * 10) / 10.0);
        
        // Token usage
        Long totalTokens = tokenUsageRepository.getTotalTokensUsed();
        Long tokensThisWeek = tokenUsageRepository.getTotalTokensUsedSince(weekAgo);
        stats.put("totalTokensUsed", totalTokens != null ? totalTokens : 0);
        stats.put("tokensThisWeek", tokensThisWeek != null ? tokensThisWeek : 0);
        
        return stats;
    }
    
    /**
     * Get user engagement analytics over time
     */
    public Map<String, Object> getEngagementAnalytics(int days) {
        Map<String, Object> analytics = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        // Filter out deleted users
        List<User> allUsers = userRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
            .collect(Collectors.toList());
        
        // Daily active users trend
        List<Map<String, Object>> dauTrend = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i + 1);
            LocalDateTime dayEnd = now.minusDays(i);
            String dateStr = dayStart.toLocalDate().toString();
            
            long activeCount = allUsers.stream()
                .filter(u -> u.getLastSeen() != null 
                    && u.getLastSeen().isAfter(dayStart) 
                    && u.getLastSeen().isBefore(dayEnd))
                .count();
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", dateStr);
            dayData.put("activeUsers", activeCount);
            dauTrend.add(dayData);
        }
        analytics.put("dauTrend", dauTrend);
        
        // New user registrations trend
        List<Map<String, Object>> registrationTrend = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i + 1);
            LocalDateTime dayEnd = now.minusDays(i);
            String dateStr = dayStart.toLocalDate().toString();
            
            long newUsers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null 
                    && u.getCreatedAt().isAfter(dayStart) 
                    && u.getCreatedAt().isBefore(dayEnd))
                .count();
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", dateStr);
            dayData.put("newUsers", newUsers);
            registrationTrend.add(dayData);
        }
        analytics.put("registrationTrend", registrationTrend);
        
        // Retention analysis (users who returned after first day)
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);
        
        // Users who joined last week
        long usersJoinedLastWeek = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null 
                && u.getCreatedAt().isAfter(twoWeeksAgo) 
                && u.getCreatedAt().isBefore(weekAgo))
            .count();
        
        // Of those, how many were active this week (retained)
        long retainedUsers = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null 
                && u.getCreatedAt().isAfter(twoWeeksAgo) 
                && u.getCreatedAt().isBefore(weekAgo)
                && u.getLastSeen() != null 
                && u.getLastSeen().isAfter(weekAgo))
            .count();
        
        double retentionRate = usersJoinedLastWeek > 0 
            ? (double) retainedUsers / usersJoinedLastWeek * 100 
            : 0;
        analytics.put("weeklyRetentionRate", Math.round(retentionRate * 10) / 10.0);
        analytics.put("retainedUsers", retainedUsers);
        analytics.put("cohortSize", usersJoinedLastWeek);
        
        return analytics;
    }
    
    /**
     * Get top users by study streak
     */
    public List<Map<String, Object>> getTopStreakUsers(int limit) {
        return profileRepository.findAll().stream()
            .filter(p -> p.getStudyStreak() != null && p.getStudyStreak() > 0)
            .sorted((a, b) -> b.getStudyStreak().compareTo(a.getStudyStreak()))
            .limit(limit)
            .map(p -> {
                Map<String, Object> user = new HashMap<>();
                user.put("userId", p.getUser().getId());
                user.put("displayName", p.getUser().getDisplayName());
                user.put("email", p.getUser().getEmail());
                user.put("streak", p.getStudyStreak());
                user.put("subjects", p.getSubjects());
                return user;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get top users by study hours this week
     */
    public List<Map<String, Object>> getTopStudyHoursUsers(int limit) {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        
        return activityRepository.findAll().stream()
            .filter(a -> a.getActivityDate() != null && a.getActivityDate().isAfter(weekAgo))
            .collect(Collectors.groupingBy(
                a -> a.getUser().getId(),
                Collectors.summingInt(a -> a.getStudyMinutes() != null ? a.getStudyMinutes() : 0)
            ))
            .entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(limit)
            .map(e -> {
                Map<String, Object> data = new HashMap<>();
                User user = userRepository.findById(e.getKey()).orElse(null);
                if (user != null) {
                    data.put("userId", user.getId());
                    data.put("displayName", user.getDisplayName());
                    data.put("email", user.getEmail());
                    data.put("minutesThisWeek", e.getValue());
                    data.put("hoursThisWeek", Math.round(e.getValue() / 60.0 * 10) / 10.0);
                }
                return data;
            })
            .filter(m -> !m.isEmpty())
            .collect(Collectors.toList());
    }
    
    /**
     * Get token usage by user
     */
    public List<Map<String, Object>> getTokenUsageByUser() {
        List<Object[]> rawData = tokenUsageRepository.getTokenUsageByUser();
        return rawData.stream()
            .map(row -> {
                Map<String, Object> data = new HashMap<>();
                data.put("userId", row[0]);
                data.put("displayName", row[1]);
                data.put("totalTokens", row[2]);
                return data;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get daily token usage for chart
     */
    public List<Map<String, Object>> getDailyTokenUsage(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return tokenUsageRepository.getDailyTokenUsage(since).stream()
            .map(row -> {
                Map<String, Object> data = new HashMap<>();
                data.put("date", row[0].toString());
                data.put("tokens", row[1]);
                return data;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get all users for management
     */
    public List<Map<String, Object>> getAllUsers() {
        // Filter out deleted users
        return userRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
            .map(u -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", u.getId());
                data.put("email", u.getEmail());
                data.put("displayName", u.getDisplayName());
                data.put("role", u.getRole().name());
                data.put("blocked", u.getBlocked());
                data.put("blockedReason", u.getBlockedReason());
                data.put("isOnline", u.getIsOnline());
                data.put("lastSeen", u.getLastSeen());
                data.put("createdAt", u.getCreatedAt());
                data.put("profileComplete", u.getProfileComplete());
                
                // Get profile info if exists
                if (u.getProfile() != null) {
                    data.put("studyStreak", u.getProfile().getStudyStreak());
                    data.put("subjects", u.getProfile().getSubjects());
                }
                
                return data;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Block a user
     */
    @Transactional
    public void blockUser(UUID userId, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == User.UserRole.ADMIN) {
            throw new RuntimeException("Cannot block admin users");
        }
        
        user.setBlocked(true);
        user.setBlockedReason(reason);
        userRepository.save(user);
        log.info("Blocked user {} for reason: {}", userId, reason);
    }
    
    /**
     * Unblock a user
     */
    @Transactional
    public void unblockUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setBlocked(false);
        user.setBlockedReason(null);
        userRepository.save(user);
        log.info("Unblocked user {}", userId);
    }
    
    /**
     * Get activity trends for charts
     */
    public Map<String, Object> getActivityTrends(int days) {
        Map<String, Object> trends = new HashMap<>();
        LocalDate startDate = LocalDate.now().minusDays(days);
        
        // Daily registrations (filter out deleted users)
        Map<String, Long> dailyRegistrations = userRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
            .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().toLocalDate().isAfter(startDate))
            .collect(Collectors.groupingBy(
                u -> u.getCreatedAt().toLocalDate().toString(),
                Collectors.counting()
            ));
        trends.put("dailyRegistrations", dailyRegistrations);
        
        // Daily study minutes
        Map<String, Integer> dailyStudyMinutes = activityRepository.findAll().stream()
            .filter(a -> a.getActivityDate() != null && a.getActivityDate().isAfter(startDate))
            .collect(Collectors.groupingBy(
                a -> a.getActivityDate().toString(),
                Collectors.summingInt(a -> a.getStudyMinutes() != null ? a.getStudyMinutes() : 0)
            ));
        trends.put("dailyStudyMinutes", dailyStudyMinutes);
        
        return trends;
    }
    
    /**
     * Get recent activity feed
     */
    public List<Map<String, Object>> getRecentActivity(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Recent registrations (filter out deleted users)
        userRepository.findAll().stream()
            .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
            .filter(u -> u.getCreatedAt() != null)
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(limit / 3)
            .forEach(u -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "registration");
                activity.put("user", u.getDisplayName());
                activity.put("timestamp", u.getCreatedAt());
                activity.put("description", u.getDisplayName() + " joined the platform");
                activities.add(activity);
            });
        
        // Recent matches
        matchRepository.findAll().stream()
            .filter(m -> m.getCreatedAt() != null && m.getStatus().name().equals("MUTUAL"))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(limit / 3)
            .forEach(m -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "match");
                activity.put("user", m.getUser1().getDisplayName());
                activity.put("timestamp", m.getCreatedAt());
                activity.put("description", m.getUser1().getDisplayName() + 
                    " matched with " + m.getUser2().getDisplayName());
                activities.add(activity);
            });
        
        // Sort all by timestamp
        activities.sort((a, b) -> 
            ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")));
        
        return activities.stream().limit(limit).toList();
    }
    
    // ========== Profile Options Management ==========
    
    /**
     * Get all profile options (subjects, study goals)
     */
    public Map<String, List<String>> getProfileOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("subjects", getOptionList(SUBJECTS_KEY, DEFAULT_SUBJECTS));
        options.put("studyGoals", getOptionList(STUDY_GOALS_KEY, DEFAULT_STUDY_GOALS));
        return options;
    }
    
    /**
     * Get subjects list
     */
    public List<String> getSubjects() {
        return getOptionList(SUBJECTS_KEY, DEFAULT_SUBJECTS);
    }
    
    /**
     * Get study goals list
     */
    public List<String> getStudyGoals() {
        return getOptionList(STUDY_GOALS_KEY, DEFAULT_STUDY_GOALS);
    }
    
    /**
     * Update subjects list
     */
    @Transactional
    public List<String> updateSubjects(List<String> subjects) {
        saveOptionList(SUBJECTS_KEY, subjects);
        log.info("Updated subjects list with {} items", subjects.size());
        return subjects;
    }
    
    /**
     * Update study goals list
     */
    @Transactional
    public List<String> updateStudyGoals(List<String> goals) {
        saveOptionList(STUDY_GOALS_KEY, goals);
        log.info("Updated study goals list with {} items", goals.size());
        return goals;
    }
    
    /**
     * Add a single subject
     */
    @Transactional
    public List<String> addSubject(String subject) {
        List<String> subjects = new ArrayList<>(getSubjects());
        if (!subjects.contains(subject)) {
            subjects.add(subject);
            saveOptionList(SUBJECTS_KEY, subjects);
            log.info("Added subject: {}", subject);
        }
        return subjects;
    }
    
    /**
     * Remove a single subject
     */
    @Transactional
    public List<String> removeSubject(String subject) {
        List<String> subjects = new ArrayList<>(getSubjects());
        subjects.remove(subject);
        saveOptionList(SUBJECTS_KEY, subjects);
        log.info("Removed subject: {}", subject);
        return subjects;
    }
    
    /**
     * Add a single study goal
     */
    @Transactional
    public List<String> addStudyGoal(String goal) {
        List<String> goals = new ArrayList<>(getStudyGoals());
        if (!goals.contains(goal)) {
            goals.add(goal);
            saveOptionList(STUDY_GOALS_KEY, goals);
            log.info("Added study goal: {}", goal);
        }
        return goals;
    }
    
    /**
     * Remove a single study goal
     */
    @Transactional
    public List<String> removeStudyGoal(String goal) {
        List<String> goals = new ArrayList<>(getStudyGoals());
        goals.remove(goal);
        saveOptionList(STUDY_GOALS_KEY, goals);
        log.info("Removed study goal: {}", goal);
        return goals;
    }
    
    // Helper methods
    private List<String> getOptionList(String key, List<String> defaultValue) {
        return appSettingsRepository.findByKey(key)
            .map(setting -> {
                try {
                    return objectMapper.readValue(setting.getValue(), 
                        new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    log.error("Failed to parse {} from database", key, e);
                    return defaultValue;
                }
            })
            .orElse(defaultValue);
    }
    
    private void saveOptionList(String key, List<String> values) {
        try {
            String json = objectMapper.writeValueAsString(values);
            AppSettings setting = appSettingsRepository.findByKey(key)
                .orElse(new AppSettings());
            setting.setKey(key);
            setting.setValue(json);
            appSettingsRepository.save(setting);
        } catch (Exception e) {
            log.error("Failed to save {} to database", key, e);
            throw new RuntimeException("Failed to save profile options", e);
        }
    }
}

