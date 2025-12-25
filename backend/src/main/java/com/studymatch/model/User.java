package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true)
    private String username;

    private String passwordHash;  // Nullable for OAuth users

    @Column(nullable = false)
    private String displayName;
    
    @Column(unique = true)
    private String googleId;  // For Google OAuth users

    @Column(nullable = false)
    @Builder.Default
    private Boolean isOnline = false;

    private LocalDateTime lastSeen;

    @Column(nullable = false)
    @Builder.Default
    private Boolean profileComplete = false;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserRole role = UserRole.USER;
    
    @Builder.Default
    private Boolean blocked = false;
    
    private String blockedReason;
    
    @Builder.Default
    private Boolean deleted = false;
    
    private LocalDateTime deletedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Profile profile;
    
    public enum UserRole {
        USER, ADMIN
    }

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

