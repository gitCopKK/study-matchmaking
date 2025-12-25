package com.studymatch.config;

import com.studymatch.service.AppSettingsService;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for AI-powered matching.
 * 
 * The 'enabled' and 'matchLimit' settings are persisted to the database
 * and will survive application restarts. Other settings are loaded from
 * application.yml as defaults.
 */
@Configuration
@ConfigurationProperties(prefix = "app.ai")
@Getter
@Setter
@Slf4j
public class AIConfig {
    
    // These are in-memory values that sync with the database
    private boolean enabled = true;
    private int matchLimit = 10;  // Number of matches to analyze with AI
    
    // These are from application.yml only
    private String provider = "groq";
    private GroqConfig groq = new GroqConfig();
    private CacheConfig cache = new CacheConfig();
    
    // Reference to settings service for persistence
    private AppSettingsService settingsService;
    
    /**
     * Initialize settings from database.
     * Called after the service is available.
     */
    public void initFromDatabase(AppSettingsService settingsService) {
        this.settingsService = settingsService;
        
        // Load persisted values (use current in-memory values as defaults)
        this.enabled = settingsService.isAiEnabled(this.enabled);
        this.matchLimit = settingsService.getAiMatchLimit(this.matchLimit);
        
        log.info("AI Config initialized from database: enabled={}, matchLimit={}", 
                this.enabled, this.matchLimit);
    }
    
    /**
     * Set enabled status and persist to database.
     */
    public void setEnabledAndPersist(boolean enabled) {
        this.enabled = enabled;
        if (settingsService != null) {
            settingsService.setAiEnabled(enabled);
        }
    }
    
    /**
     * Set match limit and persist to database.
     */
    public void setMatchLimitAndPersist(int matchLimit) {
        this.matchLimit = matchLimit;
        if (settingsService != null) {
            settingsService.setAiMatchLimit(matchLimit);
        }
    }
    
    @Getter
    @Setter
    public static class GroqConfig {
        private String apiKey;
        private String apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        private String model = "llama-3.3-70b-versatile";
        private int maxTokens = 250;
        private double temperature = 0.7;
        private boolean skipSslVerification = false;
    }
    
    @Getter
    @Setter
    public static class CacheConfig {
        private int ttlMinutes = 60;
    }
}
