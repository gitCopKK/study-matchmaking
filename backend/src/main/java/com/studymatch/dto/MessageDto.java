package com.studymatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {
    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String senderRole;  // USER or ADMIN - for showing verified badge
    private String content;
    private Boolean isRead;
    private LocalDateTime sentAt;
    
    // Delivery confirmation fields
    private String status;           // SENDING, SENT, DELIVERED, READ
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;

    @Data
    public static class SendRequest {
        private UUID conversationId;
        private String content;
    }

    @Data
    public static class TypingRequest {
        private UUID conversationId;
        private Boolean isTyping;
    }
}

