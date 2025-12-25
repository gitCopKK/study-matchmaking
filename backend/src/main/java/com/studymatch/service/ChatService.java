package com.studymatch.service;

import com.studymatch.dto.ConversationDto;
import com.studymatch.dto.MessageDto;
import com.studymatch.model.Conversation;
import com.studymatch.model.Match;
import com.studymatch.model.Message;
import com.studymatch.model.User;
import com.studymatch.repository.ConversationRepository;
import com.studymatch.repository.MatchRepository;
import com.studymatch.repository.MessageRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public List<ConversationDto> getConversations() {
        User currentUser = userService.getCurrentUser();
        List<Conversation> conversations = conversationRepository.findByUserId(currentUser.getId());

        return conversations.stream()
            .map(conv -> toConversationDto(conv, currentUser.getId()))
            .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto createOrGetConversation(UUID otherUserId) {
        User currentUser = userService.getCurrentUser();
        User otherUser = userRepository.findById(otherUserId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if conversation exists
        Conversation conversation = conversationRepository
            .findDirectConversation(currentUser, otherUser)
            .orElseGet(() -> {
                Conversation newConv = Conversation.builder()
                    .participants(new ArrayList<>(List.of(currentUser, otherUser)))
                    .build();
                return conversationRepository.save(newConv);
            });

        return toConversationDto(conversation, currentUser.getId());
    }

    public Page<MessageDto> getMessages(UUID conversationId, int page) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

        return messageRepository.findByConversationOrderBySentAtDesc(
            conversation, PageRequest.of(page, 50)
        ).map(this::toMessageDto);
    }

    @Transactional
    public MessageDto sendMessage(UUID conversationId, String content) {
        User currentUser = userService.getCurrentUser();
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Check if this is an unmatched conversation
        // Find any other participant (works even if one user was removed)
        User otherUser = conversation.getParticipants().stream()
            .filter(u -> !u.getId().equals(currentUser.getId()))
            .findFirst()
            .orElse(null);
        
        if (otherUser != null && otherUser.getRole() != User.UserRole.ADMIN) {
            // Check if the other user has deleted their account
            if (Boolean.TRUE.equals(otherUser.getDeleted())) {
                throw new RuntimeException("Cannot send message - this user's account no longer exists");
            }
            
            Optional<Match> match = matchRepository.findMatchBetweenUsers(currentUser.getId(), otherUser.getId());
            if (match.isPresent() && match.get().getStatus() == Match.MatchStatus.UNMATCHED) {
                throw new RuntimeException("Cannot send message - this match has been removed");
            }
        }

        Message message = Message.builder()
            .conversation(conversation)
            .sender(currentUser)
            .content(content)
            .build();

        message = messageRepository.save(message);
        MessageDto dto = toMessageDto(message);

        // Send to all participants via WebSocket
        for (User participant : conversation.getParticipants()) {
            if (!participant.getId().equals(currentUser.getId())) {
                messagingTemplate.convertAndSendToUser(
                    participant.getId().toString(),
                    "/queue/messages",
                    dto
                );
                
                // Create notification for the recipient (if they're not currently viewing this conversation)
                notificationService.createMessageNotification(
                    participant, 
                    currentUser, 
                    content,
                    conversationId
                );
            }
        }

        // Also send to conversation topic
        messagingTemplate.convertAndSend(
            "/topic/conversation/" + conversationId,
            dto
        );

        return dto;
    }

    @Transactional
    public void markAsRead(UUID conversationId) {
        User currentUser = userService.getCurrentUser();
        messageRepository.markAllAsRead(conversationId, currentUser.getId());
    }

    public void sendTypingIndicator(UUID conversationId, boolean isTyping) {
        User currentUser = userService.getCurrentUser();
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

        var typingData = new java.util.HashMap<String, Object>();
        typingData.put("conversationId", conversationId);
        typingData.put("userId", currentUser.getId());
        typingData.put("isTyping", isTyping);

        for (User participant : conversation.getParticipants()) {
            if (!participant.getId().equals(currentUser.getId())) {
                messagingTemplate.convertAndSendToUser(
                    participant.getId().toString(),
                    "/queue/typing",
                    typingData
                );
            }
        }
    }

    private ConversationDto toConversationDto(Conversation conv, UUID currentUserId) {
        List<ConversationDto.ParticipantDto> participants = conv.getParticipants().stream()
            .map(u -> ConversationDto.ParticipantDto.builder()
                .id(u.getId())
                .displayName(u.getDisplayName())
                .isOnline(u.getIsOnline())
                .role(u.getRole().name())
                .deleted(u.getDeleted())
                .build())
            .collect(Collectors.toList());

        MessageDto lastMessage = null;
        if (!conv.getMessages().isEmpty()) {
            lastMessage = toMessageDto(conv.getMessages().get(0));
        }

        long unreadCount = messageRepository.countUnreadMessages(conv.getId(), currentUserId);

        // Check match status for direct conversations (2 participants)
        boolean isUnmatched = false;
        boolean unmatchedByOtherUser = false;
        boolean isAdminChat = false;
        boolean isUserDeleted = false;
        
        if (conv.getParticipants().size() == 2) {
            User otherUser = conv.getParticipants().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .findFirst()
                .orElse(null);
            
            if (otherUser != null) {
                // Check if other user is admin
                isAdminChat = otherUser.getRole() == User.UserRole.ADMIN;
                
                // Check if other user has deleted their account
                isUserDeleted = Boolean.TRUE.equals(otherUser.getDeleted());
                
                // Check match status
                Optional<Match> match = matchRepository.findMatchBetweenUsers(currentUserId, otherUser.getId());
                if (match.isPresent() && match.get().getStatus() == Match.MatchStatus.UNMATCHED) {
                    isUnmatched = true;
                    // Check if the OTHER user unmatched (meaning current user should see blocked)
                    if (match.get().getUnmatchedBy() != null && 
                        match.get().getUnmatchedBy().getId().equals(otherUser.getId())) {
                        unmatchedByOtherUser = true;
                    }
                }
            }
        }

        return ConversationDto.builder()
            .id(conv.getId())
            .participants(participants)
            .lastMessage(lastMessage)
            .unreadCount(unreadCount)
            .createdAt(conv.getCreatedAt())
            .updatedAt(conv.getUpdatedAt())
            .isUnmatched(isUnmatched)
            .unmatchedByOtherUser(unmatchedByOtherUser)
            .isAdminChat(isAdminChat)
            .isUserDeleted(isUserDeleted)
            .build();
    }

    @Transactional
    public void markAsDelivered(UUID conversationId) {
        User currentUser = userService.getCurrentUser();
        List<Message> undeliveredMessages = messageRepository.findUndeliveredMessages(conversationId, currentUser.getId());
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (Message msg : undeliveredMessages) {
            msg.setStatus(Message.MessageStatus.DELIVERED);
            msg.setDeliveredAt(now);
            messageRepository.save(msg);
            
            // Notify sender that message was delivered
            messagingTemplate.convertAndSendToUser(
                msg.getSender().getId().toString(),
                "/queue/delivery",
                java.util.Map.of(
                    "messageId", msg.getId(),
                    "conversationId", conversationId,
                    "status", "DELIVERED",
                    "deliveredAt", now
                )
            );
        }
    }

    private MessageDto toMessageDto(Message msg) {
        return MessageDto.builder()
            .id(msg.getId())
            .conversationId(msg.getConversation().getId())
            .senderId(msg.getSender().getId())
            .senderRole(msg.getSender().getRole().name())  // Include role for verified badge
            .content(msg.getContent())
            .isRead(msg.getIsRead())
            .sentAt(msg.getSentAt())
            .status(msg.getStatus() != null ? msg.getStatus().name() : "SENT")
            .deliveredAt(msg.getDeliveredAt())
            .readAt(msg.getReadAt())
            .build();
    }
}

