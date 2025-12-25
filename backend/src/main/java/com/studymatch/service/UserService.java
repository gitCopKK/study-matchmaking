package com.studymatch.service;

import com.studymatch.dto.AuthResponse;
import com.studymatch.dto.ProfileDto;
import com.studymatch.dto.UserSearchDto;
import com.studymatch.model.Match;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.MatchRepository;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int DECLINE_COOLDOWN_DAYS = 7;

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MatchRepository matchRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public AuthResponse.UserDto getCurrentUserDto() {
        User user = getCurrentUser();
        return AuthResponse.UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .profileComplete(user.getProfileComplete())
            .role(user.getRole().name())
            .build();
    }
    
    public List<UserSearchDto> searchUsers(String query) {
        User currentUser = getCurrentUser();
        List<User> users = userRepository.searchUsers(currentUser.getId(), query);
        LocalDateTime cooldownStart = LocalDateTime.now().minusDays(DECLINE_COOLDOWN_DAYS);
        
        return users.stream()
            .map(user -> {
                Profile profile = profileRepository.findByUser(user).orElse(null);
                Optional<Match> existingMatch = matchRepository.findMatchBetweenUsers(
                    currentUser.getId(), user.getId());
                
                String matchStatus = existingMatch.map(m -> m.getStatus().name()).orElse(null);
                Integer cooldownDaysRemaining = null;
                
                // Check for declined match within cooldown period
                // This covers the case where the current user sent a request and it was declined
                Optional<Match> recentDeclined = matchRepository.findRecentDeclinedMatch(
                    currentUser.getId(), user.getId(), cooldownStart);
                
                if (recentDeclined.isPresent()) {
                    Match declinedMatch = recentDeclined.get();
                    long daysRemaining = ChronoUnit.DAYS.between(
                        LocalDateTime.now(), 
                        declinedMatch.getDeclinedAt().plusDays(DECLINE_COOLDOWN_DAYS)
                    ) + 1; // +1 to include the current day
                    
                    if (daysRemaining > 0) {
                        matchStatus = "DECLINED";
                        cooldownDaysRemaining = (int) daysRemaining;
                    }
                }
                
                return UserSearchDto.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .displayName(user.getDisplayName())
                    .email(user.getEmail())
                    .isOnline(user.getIsOnline())
                    .profile(profile != null ? toProfileDto(profile) : null)
                    .matchStatus(matchStatus)
                    .cooldownDaysRemaining(cooldownDaysRemaining)
                    .build();
            })
            .limit(20)
            .collect(Collectors.toList());
    }
    
    private ProfileDto toProfileDto(Profile profile) {
        return ProfileDto.builder()
            .id(profile.getId())
            .bio(profile.getBio())
            .subjects(profile.getSubjects())
            .examGoal(profile.getExamGoal())
            .learningStyle(profile.getLearningStyle())
            .preferredTimes(profile.getPreferredTimes())
            .studyStreak(profile.getStudyStreak())
            .build();
    }

    @Transactional
    public void updateOnlineStatus(UUID userId, boolean isOnline) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsOnline(isOnline);
        if (!isOnline) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse.UserDto updateUser(String displayName) {
        User user = getCurrentUser();
        if (displayName != null && !displayName.isBlank()) {
            user.setDisplayName(displayName);
        }
        userRepository.save(user);
        return AuthResponse.UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .profileComplete(user.getProfileComplete())
            .role(user.getRole().name())
            .build();
    }

    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUser();
        
        // Check if user is OAuth-only (no password set)
        if (user.getGoogleId() != null && (user.getPasswordHash() == null || user.getPasswordHash().isEmpty())) {
            throw new RuntimeException("Cannot change password for Google OAuth accounts");
        }
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteAccount() {
        User user = getCurrentUser();
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setIsOnline(false);
        userRepository.save(user);
    }
}

