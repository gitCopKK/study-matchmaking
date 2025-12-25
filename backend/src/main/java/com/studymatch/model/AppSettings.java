package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity to persist application settings to the database.
 * Uses a simple key-value store pattern.
 */
@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettings {
    
    @Id
    @Column(name = "setting_key", length = 100)
    private String key;
    
    @Column(name = "setting_value", length = 500)
    private String value;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Convenience factory methods
    public static AppSettings of(String key, String value) {
        return AppSettings.builder()
                .key(key)
                .value(value)
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    public static AppSettings of(String key, int value) {
        return of(key, String.valueOf(value));
    }
    
    public static AppSettings of(String key, boolean value) {
        return of(key, String.valueOf(value));
    }
}

