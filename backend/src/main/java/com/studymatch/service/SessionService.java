package com.studymatch.service;

import com.studymatch.dto.SessionDto;
import com.studymatch.model.GroupMember;
import com.studymatch.model.StudyGroup;
import com.studymatch.model.StudySession;
import com.studymatch.model.User;
import com.studymatch.repository.StudyGroupRepository;
import com.studymatch.repository.StudySessionRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final StudySessionRepository sessionRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<SessionDto> getSessions() {
        User currentUser = userService.getCurrentUser();
        List<StudySession> sessions = sessionRepository.findByUserId(currentUser.getId());
        return sessions.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<SessionDto> getUpcomingSessions() {
        User currentUser = userService.getCurrentUser();
        List<StudySession> sessions = sessionRepository.findUpcomingSessions(
            currentUser.getId(), LocalDateTime.now()
        );
        return sessions.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SessionDto createSession(SessionDto.CreateRequest request) {
        User currentUser = userService.getCurrentUser();
        
        // Validate: either partnerId or groupId must be provided, but not both
        if (request.getPartnerId() == null && request.getGroupId() == null) {
            throw new IllegalArgumentException("Either Partner ID or Group ID is required to create a session");
        }
        
        if (request.getPartnerId() != null && request.getGroupId() != null) {
            throw new IllegalArgumentException("Cannot specify both Partner ID and Group ID for a session");
        }

        StudySession.StudySessionBuilder sessionBuilder = StudySession.builder()
            .creator(currentUser)
            .title(request.getTitle())
            .scheduledAt(request.getScheduledAt())
            .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
            .status(StudySession.SessionStatus.SCHEDULED);

        if (request.getGroupId() != null) {
            // Group session
            StudyGroup group = studyGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Study group not found"));
            
            // Verify current user is a member of the group
            boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (!isMember && !group.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new RuntimeException("You must be a member of the group to create a session");
            }
            
            sessionBuilder.studyGroup(group);
            
            StudySession session = sessionRepository.save(sessionBuilder.build());
            
            // Notify all group members except the creator
            for (GroupMember member : group.getMembers()) {
                if (!member.getUser().getId().equals(currentUser.getId())) {
                    notificationService.createSessionNotification(member.getUser(), session);
                }
            }
            // Also notify group creator if different from session creator
            if (!group.getCreatedBy().getId().equals(currentUser.getId())) {
                notificationService.createSessionNotification(group.getCreatedBy(), session);
            }
            
            return toDto(session);
        } else {
            // Partner session (1-on-1)
            User partner = userRepository.findById(request.getPartnerId())
                .orElseThrow(() -> new RuntimeException("Partner not found"));

            sessionBuilder.partner(partner);
            
            StudySession session = sessionRepository.save(sessionBuilder.build());

            // Notify partner
            notificationService.createSessionNotification(partner, session);

            return toDto(session);
        }
    }

    @Transactional
    public SessionDto updateSession(UUID sessionId, SessionDto.UpdateRequest request) {
        StudySession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));

        if (request.getTitle() != null) {
            session.setTitle(request.getTitle());
        }
        if (request.getScheduledAt() != null) {
            session.setScheduledAt(request.getScheduledAt());
        }
        if (request.getDurationMinutes() != null) {
            session.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getStatus() != null) {
            session.setStatus(StudySession.SessionStatus.valueOf(request.getStatus()));
        }

        session = sessionRepository.save(session);
        return toDto(session);
    }

    @Transactional
    public void deleteSession(UUID sessionId) {
        StudySession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setStatus(StudySession.SessionStatus.CANCELLED);
        sessionRepository.save(session);
    }

    private SessionDto toDto(StudySession session) {
        User currentUser = userService.getCurrentUser();
        
        SessionDto.SessionDtoBuilder builder = SessionDto.builder()
            .id(session.getId())
            .title(session.getTitle())
            .creator(SessionDto.PartnerDto.builder()
                .id(session.getCreator().getId())
                .displayName(session.getCreator().getDisplayName())
                .build())
            .scheduledAt(session.getScheduledAt())
            .durationMinutes(session.getDurationMinutes())
            .status(session.getStatus().name())
            .createdAt(session.getCreatedAt());

        if (session.getStudyGroup() != null) {
            // Group session
            StudyGroup group = session.getStudyGroup();
            builder.isGroupSession(true)
                .group(SessionDto.GroupDto.builder()
                    .id(group.getId())
                    .name(group.getName())
                    .memberCount(group.getMembers().size())
                    .build());
            
            // Build participants list from group members
            List<SessionDto.PartnerDto> participants = new ArrayList<>();
            participants.add(SessionDto.PartnerDto.builder()
                .id(group.getCreatedBy().getId())
                .displayName(group.getCreatedBy().getDisplayName())
                .build());
            for (GroupMember member : group.getMembers()) {
                if (!member.getUser().getId().equals(group.getCreatedBy().getId())) {
                    participants.add(SessionDto.PartnerDto.builder()
                        .id(member.getUser().getId())
                        .displayName(member.getUser().getDisplayName())
                        .build());
                }
            }
            builder.participants(participants);
        } else if (session.getPartner() != null) {
            // 1-on-1 session - show the OTHER person as partner
            // If current user is the creator, show the partner
            // If current user is the partner, show the creator
            User otherUser;
            if (currentUser.getId().equals(session.getCreator().getId())) {
                otherUser = session.getPartner();
            } else {
                otherUser = session.getCreator();
            }
            
            builder.isGroupSession(false)
                .partner(SessionDto.PartnerDto.builder()
                    .id(otherUser.getId())
                    .displayName(otherUser.getDisplayName())
                    .build());
        }

        return builder.build();
    }

    /**
     * Scheduled job to delete expired sessions.
     * Runs every 15 minutes to clean up sessions where scheduledAt + durationMinutes has passed.
     */
    @Scheduled(fixedRate = 900000) // Every 15 minutes (900000 ms)
    @Transactional
    public void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<StudySession> expiredSessions = sessionRepository.findExpiredSessions(now);
        
        if (!expiredSessions.isEmpty()) {
            log.info("Cleaning up {} expired sessions", expiredSessions.size());
            sessionRepository.deleteAll(expiredSessions);
            log.info("Successfully deleted {} expired sessions", expiredSessions.size());
        }
    }
}

