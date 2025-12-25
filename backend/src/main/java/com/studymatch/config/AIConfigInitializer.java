package com.studymatch.config;

import com.studymatch.service.AppSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Initializer that loads AI settings from the database after application startup.
 * This ensures that persisted settings (like matchLimit) survive restarts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AIConfigInitializer {
    
    private final AIConfig aiConfig;
    private final AppSettingsService appSettingsService;
    
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Initializing AI settings from database...");
        aiConfig.initFromDatabase(appSettingsService);
    }
}

