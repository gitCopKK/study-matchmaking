package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConversationDto {
    private UUID id;
    private List<ParticipantDto> participants;
    private MessageDto lastMessage;
    private Long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Match status info
    private Boolean isUnmatched;
    private Boolean unmatchedByOtherUser;  // True if the other user unmatched (current user should see blocked)
    private Boolean isAdminChat;  // True if chatting with admin
    private Boolean isUserDeleted;  // True if the other user has deleted their account

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ParticipantDto {
        private UUID id;
        private String displayName;
        private Boolean isOnline;
        private String role;  // Add role to identify admin
        private Boolean deleted;  // True if user has deleted their account
    }

    @Data
    public static class CreateRequest {
        private UUID userId;  // For backward compatibility
        private List<UUID> participantIds;  // For admin to start chat with any user
        
        // Get the user ID from either field
        public UUID getTargetUserId() {
            if (participantIds != null && !participantIds.isEmpty()) {
                return participantIds.get(0);
            }
            return userId;
        }
    }
}

