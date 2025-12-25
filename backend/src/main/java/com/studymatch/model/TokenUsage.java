package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "token_usage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenUsage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Integer promptTokens;
    
    @Column(nullable = false)
    private Integer completionTokens;
    
    @Column(nullable = false)
    private Integer totalTokens;
    
    @Column(nullable = false)
    private String operation; // e.g., "match_analysis", "chat_assist"
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

