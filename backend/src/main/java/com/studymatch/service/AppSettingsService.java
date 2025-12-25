package com.studymatch.service;

import com.studymatch.model.AppSettings;
import com.studymatch.repository.AppSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing application settings persisted in the database.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppSettingsService {
    
    // Setting keys as constants
    public static final String AI_ENABLED = "ai.enabled";
    public static final String AI_MATCH_LIMIT = "ai.matchLimit";
    
    private final AppSettingsRepository repository;
    
    /**
     * Get a setting value as String.
     */
    public Optional<String> getString(String key) {
        return repository.findByKey(key).map(AppSettings::getValue);
    }
    
    /**
     * Get a setting value as Integer.
     */
    public Optional<Integer> getInt(String key) {
        return getString(key).map(Integer::parseInt);
    }
    
    /**
     * Get a setting value as Boolean.
     */
    public Optional<Boolean> getBoolean(String key) {
        return getString(key).map(Boolean::parseBoolean);
    }
    
    /**
     * Get a setting with a default value.
     */
    public String getString(String key, String defaultValue) {
        return getString(key).orElse(defaultValue);
    }
    
    public int getInt(String key, int defaultValue) {
        return getInt(key).orElse(defaultValue);
    }
    
    public boolean getBoolean(String key, boolean defaultValue) {
        return getBoolean(key).orElse(defaultValue);
    }
    
    /**
     * Set a String setting value.
     */
    @Transactional
    public void set(String key, String value) {
        AppSettings setting = repository.findByKey(key)
                .orElse(AppSettings.of(key, value));
        setting.setValue(value);
        repository.save(setting);
        log.info("Updated setting: {} = {}", key, value);
    }
    
    /**
     * Set an Integer setting value.
     */
    @Transactional
    public void set(String key, int value) {
        set(key, String.valueOf(value));
    }
    
    /**
     * Set a Boolean setting value.
     */
    @Transactional
    public void set(String key, boolean value) {
        set(key, String.valueOf(value));
    }
    
    // ========== Convenience methods for AI settings ==========
    
    public boolean isAiEnabled(boolean defaultValue) {
        return getBoolean(AI_ENABLED, defaultValue);
    }
    
    public int getAiMatchLimit(int defaultValue) {
        return getInt(AI_MATCH_LIMIT, defaultValue);
    }
    
    @Transactional
    public void setAiEnabled(boolean enabled) {
        set(AI_ENABLED, enabled);
    }
    
    @Transactional
    public void setAiMatchLimit(int limit) {
        set(AI_MATCH_LIMIT, limit);
    }
}

