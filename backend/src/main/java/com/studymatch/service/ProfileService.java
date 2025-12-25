package com.studymatch.service;

import com.studymatch.dto.BadgeDto;
import com.studymatch.dto.ProfileDto;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.UserBadgeRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserBadgeRepository userBadgeRepository;

    public ProfileDto getMyProfile() {
        User user = userService.getCurrentUser();
        Profile profile = profileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return toDto(profile);
    }

    public ProfileDto getProfileByUserId(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Profile not found"));
        return toDto(profile);
    }

    @Transactional
    public ProfileDto updateMyProfile(ProfileDto.UpdateRequest request) {
        User user = userService.getCurrentUser();
        Profile profile = profileRepository.findByUser(user)
            .orElseGet(() -> Profile.builder().user(user).build());

        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getSubjects() != null) {
            profile.setSubjects(request.getSubjects());
        }
        if (request.getExamGoal() != null) {
            profile.setExamGoal(request.getExamGoal());
        }
        if (request.getLearningStyle() != null) {
            profile.setLearningStyle(request.getLearningStyle());
        }
        if (request.getPreferredTimes() != null) {
            profile.setPreferredTimes(request.getPreferredTimes());
        }
        if (request.getStrengths() != null) {
            profile.setStrengths(request.getStrengths());
        }
        if (request.getWeaknesses() != null) {
            profile.setWeaknesses(request.getWeaknesses());
        }
        
        // Study Goals
        if (request.getDailyGoalMinutes() != null) {
            profile.setDailyGoalMinutes(request.getDailyGoalMinutes());
        }
        if (request.getWeeklyGoalMinutes() != null) {
            profile.setWeeklyGoalMinutes(request.getWeeklyGoalMinutes());
        }

        profile = profileRepository.save(profile);

        // Mark profile as complete if key fields are filled
        if (profile.getSubjects() != null && !profile.getSubjects().isEmpty()
            && profile.getLearningStyle() != null) {
            user.setProfileComplete(true);
            userRepository.save(user);
        }

        return toDto(profile);
    }

    private ProfileDto toDto(Profile profile) {
        User profileUser = profile.getUser();
        
        // Get badge count and recent badges
        Integer badgeCount = userBadgeRepository.countByUserId(profileUser.getId());
        List<BadgeDto> recentBadges = userBadgeRepository.findByUserIdWithBadge(profileUser.getId())
            .stream()
            .limit(5)
            .map(ub -> BadgeDto.builder()
                .id(ub.getBadge().getId())
                .code(ub.getBadge().getCode())
                .name(ub.getBadge().getName())
                .emoji(ub.getBadge().getEmoji())
                .earnedAt(ub.getEarnedAt())
                .earned(true)
                .build())
            .collect(Collectors.toList());
        
        return ProfileDto.builder()
            .id(profile.getId())
            .userId(profileUser.getId())
            .displayName(profileUser.getDisplayName())
            .username(profileUser.getUsername())
            .email(profileUser.getEmail())
            .bio(profile.getBio())
            .subjects(profile.getSubjects())
            .examGoal(profile.getExamGoal())
            .learningStyle(profile.getLearningStyle())
            .preferredTimes(profile.getPreferredTimes())
            .strengths(profile.getStrengths())
            .weaknesses(profile.getWeaknesses())
            .studyStreak(profile.getStudyStreak())
            .dailyGoalMinutes(profile.getDailyGoalMinutes())
            .weeklyGoalMinutes(profile.getWeeklyGoalMinutes())
            .badgeCount(badgeCount != null ? badgeCount : 0)
            .recentBadges(recentBadges)
            .build();
    }
}
