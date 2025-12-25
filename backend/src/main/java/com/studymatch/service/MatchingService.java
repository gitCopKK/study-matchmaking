package com.studymatch.service;

import com.studymatch.config.AIConfig;
import com.studymatch.dto.MatchDto;
import com.studymatch.dto.ProfileDto;
import com.studymatch.model.Conversation;
import com.studymatch.model.Match;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.ConversationRepository;
import com.studymatch.repository.MatchRepository;
import com.studymatch.repository.MessageRepository;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final AIMatchingService aiMatchingService;
    private final AIConfig aiConfig;

    // Matching weights
    private static final double SUBJECT_WEIGHT = 0.30;
    private static final double SCHEDULE_WEIGHT = 0.25;
    private static final double LEARNING_STYLE_WEIGHT = 0.15;
    private static final double EXAM_GOAL_WEIGHT = 0.10;
    private static final double STREAK_WEIGHT = 0.10;
    private static final double BEHAVIOR_WEIGHT = 0.10;

    public List<MatchDto> getSuggestions() {
        User currentUser = userService.getCurrentUser();
        Profile currentProfile = profileRepository.findByUser(currentUser)
            .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<User> potentialMatches = userRepository.findAllExceptUser(currentUser.getId());

        // First pass: rule-based filtering and scoring
        List<CandidateMatch> candidates = new ArrayList<>();

        for (User candidate : potentialMatches) {
            // Skip if user is deleted
            if (Boolean.TRUE.equals(candidate.getDeleted())) {
                continue;
            }
            
            // Skip if already matched
            if (matchRepository.existsBetweenUsers(currentUser.getId(), candidate.getId())) {
                continue;
            }

            Profile candidateProfile = profileRepository.findByUser(candidate).orElse(null);
            if (candidateProfile == null) continue;

            int baseScore = calculateCompatibility(currentProfile, candidateProfile);
            String baseReason = generateMatchReason(currentProfile, candidateProfile);

            candidates.add(new CandidateMatch(candidate, candidateProfile, baseScore, baseReason));
        }

        // Sort by base score and take top N for AI analysis (configurable via admin)
        int aiMatchLimit = aiConfig.getMatchLimit();
        candidates.sort((a, b) -> Integer.compare(b.baseScore, a.baseScore));
        List<CandidateMatch> topCandidates = candidates.stream().limit(aiMatchLimit).collect(Collectors.toList());

        // Second pass: AI enhancement for top candidates
        List<MatchDto> suggestions = new ArrayList<>();
        boolean aiAvailable = aiMatchingService.isAvailable();
        
        if (aiAvailable) {
            log.info("AI matching enabled (limit: {}), enhancing top {} candidates", aiMatchLimit, topCandidates.size());
        }

        for (CandidateMatch cm : topCandidates) {
            int finalScore = cm.baseScore;
            String finalReason = cm.baseReason;
            List<String> studyRecommendations = List.of();
            Double semanticSimilarity = null;
            boolean aiEnhanced = false;

            // Try AI enhancement
            if (aiAvailable) {
                try {
                    AIMatchingService.AIMatchResult aiResult = aiMatchingService.analyzeCompatibility(
                        currentProfile, cm.profile, cm.user.getDisplayName(), cm.baseScore);
                    
                    if (aiResult.personalizedReason() != null) {
                        finalScore = aiResult.adjustedScore();
                        finalReason = aiResult.personalizedReason();
                        studyRecommendations = aiResult.studyRecommendations();
                        semanticSimilarity = aiResult.semanticSimilarity();
                        aiEnhanced = true;
                    }
                } catch (Exception e) {
                    log.warn("AI enhancement failed for candidate {}: {}", cm.user.getId(), e.getMessage());
                }
            }

            // Create a DTO for the suggestion WITHOUT persisting to the database
            // The match is only created when user explicitly sends a request via sendMatchRequest()
            suggestions.add(toSuggestionDto(cm.user, cm.profile, finalScore, finalReason, aiEnhanced, studyRecommendations, semanticSimilarity));
        }

        // Sort by final score descending
        suggestions.sort((a, b) -> b.getCompatibilityScore().compareTo(a.getCompatibilityScore()));

        return suggestions.stream().limit(20).collect(Collectors.toList());
    }
    
    // Helper class for candidate processing
    private record CandidateMatch(User user, Profile profile, int baseScore, String baseReason) {}

    public List<MatchDto> getMutualMatches() {
        User currentUser = userService.getCurrentUser();
        List<Match> matches = matchRepository.findMutualMatches(currentUser.getId());

        return matches.stream()
            .map(match -> {
                User otherUser = match.getUser1().getId().equals(currentUser.getId())
                    ? match.getUser2() : match.getUser1();
                Profile otherProfile = profileRepository.findByUser(otherUser).orElse(null);
                return toDto(match, otherUser, otherProfile);
            })
            .filter(dto -> !Boolean.TRUE.equals(dto.getUser().getDeleted()))
            .collect(Collectors.toList());
    }

    @Transactional
    public MatchDto acceptMatch(UUID matchId) {
        User currentUser = userService.getCurrentUser();
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));

        User otherUser;
        
        // Determine who the "other user" is
        if (match.getUser1().getId().equals(currentUser.getId())) {
            otherUser = match.getUser2();
        } else {
            otherUser = match.getUser1();
        }
        
        // For friend request model: accepting a PENDING request = MUTUAL
        // User1 (requester) already expressed interest by sending the request
        // User2 (recipient) accepting means it's mutual
        if (match.getStatus() == Match.MatchStatus.PENDING) {
            match.setStatus(Match.MatchStatus.MUTUAL);
            match = matchRepository.save(match);
            
            // Notify both users about the new connection
            notificationService.createMatchNotification(match.getUser1(), match.getUser2());
            
            log.info("Match {} became MUTUAL between {} and {}", 
                match.getId(), match.getUser1().getDisplayName(), match.getUser2().getDisplayName());
        } else if (match.getStatus() == Match.MatchStatus.ACCEPTED) {
            // Legacy: if somehow status was ACCEPTED, make it MUTUAL
            match.setStatus(Match.MatchStatus.MUTUAL);
            match = matchRepository.save(match);
            notificationService.createMatchNotification(match.getUser1(), match.getUser2());
        }
        
        Profile otherProfile = profileRepository.findByUser(otherUser).orElse(null);

        return toDto(match, otherUser, otherProfile);
    }

    @Transactional
    public void declineMatch(UUID matchId) {
        Match match = matchRepository.findById(matchId)
            .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setStatus(Match.MatchStatus.DECLINED);
        match.setDeclinedAt(LocalDateTime.now());
        matchRepository.save(match);
    }
    
    @Transactional
    public void clearPendingMatches() {
        User currentUser = userService.getCurrentUser();
        matchRepository.deletePendingMatchesForUser(currentUser.getId());
        log.info("Cleared pending matches for user {}", currentUser.getId());
    }

    private static final int DECLINE_COOLDOWN_DAYS = 7;
    
    @Transactional
    public MatchDto sendMatchRequest(UUID targetUserId) {
        User currentUser = userService.getCurrentUser();
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if there was a recent declined request (within 7 days)
        LocalDateTime cooldownStart = LocalDateTime.now().minusDays(DECLINE_COOLDOWN_DAYS);
        Optional<Match> recentDeclined = matchRepository.findRecentDeclinedMatch(
            currentUser.getId(), targetUserId, cooldownStart);
        
        if (recentDeclined.isPresent()) {
            Match declinedMatch = recentDeclined.get();
            long daysRemaining = ChronoUnit.DAYS.between(
                LocalDateTime.now(), 
                declinedMatch.getDeclinedAt().plusDays(DECLINE_COOLDOWN_DAYS)
            ) + 1; // +1 to include the current day
            
            throw new RuntimeException("COOLDOWN:" + daysRemaining + ":This user declined your request. You can send another request in " + daysRemaining + " day" + (daysRemaining > 1 ? "s" : ""));
        }
        
        // Check if match already exists
        Optional<Match> existingMatch = matchRepository.findMatchBetweenUsers(currentUser.getId(), targetUserId);
        if (existingMatch.isPresent()) {
            Match match = existingMatch.get();
            // If the existing match is DECLINED and cooldown has passed, delete it to allow a new request
            if (match.getStatus() == Match.MatchStatus.DECLINED) {
                matchRepository.delete(match);
                log.info("Deleted expired declined match {} to allow new request", match.getId());
            } else {
                throw new RuntimeException("Match request already exists");
            }
        }
        
        Profile targetProfile = profileRepository.findByUser(targetUser).orElse(null);
        Profile currentProfile = profileRepository.findByUser(currentUser).orElse(null);
        
        int score = currentProfile != null && targetProfile != null 
            ? calculateCompatibility(currentProfile, targetProfile) 
            : 50;
        
        Match match = Match.builder()
            .user1(currentUser)
            .user2(targetUser)
            .compatibilityScore(score)
            .matchReason("Friend request from " + currentUser.getDisplayName())
            .status(Match.MatchStatus.PENDING)
            .build();
        
        match = matchRepository.save(match);
        
        // Send notification to target user
        notificationService.createMatchRequestNotification(targetUser, currentUser, match.getId());
        
        return toDto(match, targetUser, targetProfile);
    }
    
    public List<MatchDto> getPendingRequests() {
        User currentUser = userService.getCurrentUser();
        List<Match> pendingMatches = matchRepository.findPendingRequestsForUser(currentUser.getId());
        
        return pendingMatches.stream()
            .map(match -> {
                User requester = match.getUser1();
                Profile requesterProfile = profileRepository.findByUser(requester).orElse(null);
                return toDto(match, requester, requesterProfile);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public void removeMatchWithUser(UUID otherUserId, boolean deleteChat) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        log.info("=== UNMATCH OPERATION START ===");
        log.info("Current user: {} ({})", currentUser.getDisplayName(), currentUser.getId());
        log.info("Other user: {} ({})", otherUser.getDisplayName(), otherUserId);
        log.info("DELETE CHAT PARAMETER: {}", deleteChat);
        
        // Don't allow unmatching with admin
        if (otherUser.getRole() == User.UserRole.ADMIN) {
            throw new RuntimeException("Cannot unmatch with admin");
        }
        
        // Find and update match status to UNMATCHED
        matchRepository.findMatchBetweenUsers(currentUser.getId(), otherUserId)
            .ifPresent(match -> {
                match.setStatus(Match.MatchStatus.UNMATCHED);
                match.setUnmatchedBy(currentUser);
                matchRepository.save(match);
                log.info("Match status updated to UNMATCHED");
            });
        
        // Handle conversation based on deleteChat preference
        if (deleteChat) {
            log.info(">>> deleteChat=TRUE - Will remove user from conversation");
            conversationRepository.findConversationBetweenUsers(currentUser.getId(), otherUserId)
                .ifPresent(conversation -> {
                    log.info("Found conversation: {}", conversation.getId());
                    log.info("Participants before: {}", conversation.getParticipants().stream()
                        .map(User::getDisplayName).toList());
                    conversation.getParticipants().removeIf(p -> p.getId().equals(currentUser.getId()));
                    conversationRepository.save(conversation);
                    log.info("Participants after: {}", conversation.getParticipants().stream()
                        .map(User::getDisplayName).toList());
                });
        } else {
            log.info(">>> deleteChat=FALSE - Conversation will NOT be modified");
        }
        log.info("=== UNMATCH OPERATION END ===");
    }

    private int calculateCompatibility(Profile p1, Profile p2) {
        double score = 0;

        // Subject overlap (30%)
        score += SUBJECT_WEIGHT * calculateListOverlap(p1.getSubjects(), p2.getSubjects());

        // Schedule alignment (25%)
        score += SCHEDULE_WEIGHT * calculateListOverlap(p1.getPreferredTimes(), p2.getPreferredTimes());

        // Learning style compatibility (15%)
        if (p1.getLearningStyle() != null && p2.getLearningStyle() != null) {
            score += LEARNING_STYLE_WEIGHT * (p1.getLearningStyle().equals(p2.getLearningStyle()) ? 1.0 : 0.5);
        }

        // Exam goal match (10%)
        if (p1.getExamGoal() != null && p2.getExamGoal() != null) {
            score += EXAM_GOAL_WEIGHT * (p1.getExamGoal().equalsIgnoreCase(p2.getExamGoal()) ? 1.0 : 0.3);
        }

        // Study streak similarity (10%)
        int streak1 = p1.getStudyStreak() != null ? p1.getStudyStreak() : 0;
        int streak2 = p2.getStudyStreak() != null ? p2.getStudyStreak() : 0;
        double streakDiff = Math.abs(streak1 - streak2);
        score += STREAK_WEIGHT * Math.max(0, 1.0 - streakDiff / 30.0);

        // Base behavior score (10%)
        score += BEHAVIOR_WEIGHT * 0.7; // Default positive assumption

        return (int) Math.round(score * 100);
    }

    private double calculateListOverlap(List<String> list1, List<String> list2) {
        if (list1 == null || list2 == null || list1.isEmpty() || list2.isEmpty()) {
            return 0.0;
        }

        Set<String> set1 = new HashSet<>(list1.stream().map(String::toLowerCase).toList());
        Set<String> set2 = new HashSet<>(list2.stream().map(String::toLowerCase).toList());

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / union.size();
    }

    private String generateMatchReason(Profile p1, Profile p2) {
        List<String> reasons = new ArrayList<>();

        // Check subject overlap
        if (p1.getSubjects() != null && p2.getSubjects() != null) {
            Set<String> common = new HashSet<>(p1.getSubjects());
            common.retainAll(new HashSet<>(p2.getSubjects()));
            if (!common.isEmpty()) {
                reasons.add("Both study " + String.join(", ", common.stream().limit(2).toList()));
            }
        }

        // Check schedule overlap
        if (p1.getPreferredTimes() != null && p2.getPreferredTimes() != null) {
            Set<String> commonTimes = new HashSet<>(p1.getPreferredTimes());
            commonTimes.retainAll(new HashSet<>(p2.getPreferredTimes()));
            if (!commonTimes.isEmpty()) {
                reasons.add("Similar study schedule");
            }
        }

        // Check learning style
        if (p1.getLearningStyle() != null && p1.getLearningStyle().equals(p2.getLearningStyle())) {
            reasons.add("Same learning style");
        }

        // Check exam goal
        if (p1.getExamGoal() != null && p2.getExamGoal() != null 
            && p1.getExamGoal().equalsIgnoreCase(p2.getExamGoal())) {
            reasons.add("Same exam goal: " + p1.getExamGoal());
        }

        if (reasons.isEmpty()) {
            return "Potential study partner match";
        }

        return String.join(" • ", reasons);
    }

    private MatchDto toDto(Match match, User otherUser, Profile otherProfile) {
        return toDto(match, otherUser, otherProfile, false, List.of(), null);
    }
    
    // Create a suggestion DTO without requiring a persisted Match entity
    // Used for displaying suggestions that haven't been saved to the database yet
    private MatchDto toSuggestionDto(User otherUser, Profile otherProfile, int compatibilityScore, 
                                      String matchReason, boolean aiEnhanced, 
                                      List<String> studyRecommendations, Double semanticSimilarity) {
        ProfileDto profileDto = null;
        if (otherProfile != null) {
            profileDto = ProfileDto.builder()
                .id(otherProfile.getId())
                .bio(otherProfile.getBio())
                .subjects(otherProfile.getSubjects())
                .examGoal(otherProfile.getExamGoal())
                .learningStyle(otherProfile.getLearningStyle())
                .preferredTimes(otherProfile.getPreferredTimes())
                .studyStreak(otherProfile.getStudyStreak())
                .build();
        }

        // Use the target user's ID as the suggestion ID (since there's no match record yet)
        return MatchDto.builder()
            .id(otherUser.getId()) // Use user ID as suggestion identifier
            .user(MatchDto.UserWithProfile.builder()
                .id(otherUser.getId())
                .username(otherUser.getUsername())
                .displayName(otherUser.getDisplayName())
                .email(otherUser.getEmail())
                .isOnline(otherUser.getIsOnline())
                .deleted(otherUser.getDeleted())
                .profile(profileDto)
                .build())
            .compatibilityScore(compatibilityScore)
            .matchReason(matchReason)
            .status("SUGGESTION") // Mark as suggestion, not pending request
            .createdAt(null)
            .aiEnhanced(aiEnhanced)
            .studyRecommendations(studyRecommendations)
            .semanticSimilarity(semanticSimilarity)
            .build();
    }
    
    private MatchDto toDto(Match match, User otherUser, Profile otherProfile, 
                           boolean aiEnhanced, List<String> studyRecommendations, Double semanticSimilarity) {
        ProfileDto profileDto = null;
        if (otherProfile != null) {
            profileDto = ProfileDto.builder()
                .id(otherProfile.getId())
                .bio(otherProfile.getBio())
                .subjects(otherProfile.getSubjects())
                .examGoal(otherProfile.getExamGoal())
                .learningStyle(otherProfile.getLearningStyle())
                .preferredTimes(otherProfile.getPreferredTimes())
                .studyStreak(otherProfile.getStudyStreak())
                .build();
        }

        return MatchDto.builder()
            .id(match.getId())
            .user(MatchDto.UserWithProfile.builder()
                .id(otherUser.getId())
                .username(otherUser.getUsername())
                .displayName(otherUser.getDisplayName())
                .email(otherUser.getEmail())
                .isOnline(otherUser.getIsOnline())
                .deleted(otherUser.getDeleted())
                .profile(profileDto)
                .build())
            .compatibilityScore(match.getCompatibilityScore())
            .matchReason(match.getMatchReason())
            .status(match.getStatus().name())
            .createdAt(match.getCreatedAt())
            .aiEnhanced(aiEnhanced)
            .studyRecommendations(studyRecommendations)
            .semanticSimilarity(semanticSimilarity)
            .build();
    }
}

