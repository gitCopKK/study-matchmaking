package com.studymatch.service;

import com.studymatch.dto.NotificationDto;
import com.studymatch.model.Notification;
import com.studymatch.model.StudySession;
import com.studymatch.model.User;
import com.studymatch.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    public Page<NotificationDto> getNotifications(int page) {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
            currentUser.getId(), PageRequest.of(page, 20)
        ).map(this::toDto);
    }

    public long getUnreadCount() {
        User currentUser = userService.getCurrentUser();
        return notificationRepository.countUnread(currentUser.getId());
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        notificationRepository.markAllAsRead(currentUser.getId());
    }

    @Transactional
    public void createNotification(User user, Notification.NotificationType type, String message, String link) {
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .message(message)
            .link(link)
            .build();

        notification = notificationRepository.save(notification);

        // Push via WebSocket
        messagingTemplate.convertAndSendToUser(
            user.getId().toString(),
            "/queue/notifications",
            toDto(notification)
        );
    }

    public void createMatchNotification(User user1, User user2) {
        createNotification(
            user1,
            Notification.NotificationType.MATCH,
            "You matched with " + user2.getDisplayName() + "! Start chatting now.",
            "/chat"
        );
        createNotification(
            user2,
            Notification.NotificationType.MATCH,
            "You matched with " + user1.getDisplayName() + "! Start chatting now.",
            "/chat"
        );
    }

    public void createMessageNotification(User recipient, User sender, String messageContent, java.util.UUID conversationId) {
        // Truncate message if too long
        String preview = messageContent.length() > 50 
            ? messageContent.substring(0, 47) + "..." 
            : messageContent;
        
        createNotification(
            recipient,
            Notification.NotificationType.MESSAGE,
            sender.getDisplayName() + ": " + preview,
            "/chat/" + conversationId
        );
    }

    public void createSessionNotification(User user, StudySession session) {
        createNotification(
            user,
            Notification.NotificationType.SESSION,
            session.getCreator().getDisplayName() + " scheduled a study session: " + session.getTitle(),
            "/sessions"
        );
    }

    public void createUnmatchNotification(User recipient, User unmatcher) {
        createNotification(
            recipient,
            Notification.NotificationType.MATCH,  // Reusing MATCH type for unmatch
            unmatcher.getDisplayName() + " has unmatched with you.",
            "/chat"
        );
    }
    
    public void createMatchRequestNotification(User recipient, User requester, java.util.UUID matchId) {
        createNotification(
            recipient,
            Notification.NotificationType.MATCH_REQUEST,
            requester.getDisplayName() + " (@" + requester.getUsername() + ") wants to connect with you!",
            "/matches?tab=requests&matchId=" + matchId
        );
    }

    // Session reminder job - runs every minute
    @Scheduled(fixedRate = 60000)
    public void sendSessionReminders() {
        // Find sessions starting in 15 minutes
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusMinutes(15);

        // Implementation would query for sessions and send reminders
        // Simplified for demo
    }

    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
            .id(notification.getId())
            .type(notification.getType().name())
            .message(notification.getMessage())
            .link(notification.getLink())
            .read(notification.getRead())
            .createdAt(notification.getCreatedAt())
            .build();
    }
}

