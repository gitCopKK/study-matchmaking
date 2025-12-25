package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Builder.Default
    private Boolean isRead = false;
    
    // Message delivery status: SENDING -> SENT -> DELIVERED -> READ
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;
    
    // Timestamp when message was delivered to recipient's device
    private LocalDateTime deliveredAt;
    
    // Timestamp when message was read by recipient
    private LocalDateTime readAt;

    @CreationTimestamp
    private LocalDateTime sentAt;
    
    public enum MessageStatus {
        SENDING,   // Message is being sent (client-side only)
        SENT,      // Message saved to server
        DELIVERED, // Message delivered to recipient's device
        READ       // Message read by recipient
    }
}

