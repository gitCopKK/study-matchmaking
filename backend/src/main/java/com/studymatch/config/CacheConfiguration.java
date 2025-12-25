package com.studymatch.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for AI matching results.
 */
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class CacheConfiguration {
    
    private final AIConfig aiConfig;
    
    public static final String AI_MATCH_CACHE = "aiMatchCache";
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(AI_MATCH_CACHE);
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .expireAfterWrite(aiConfig.getCache().getTtlMinutes(), TimeUnit.MINUTES)
            .maximumSize(1000)
            .recordStats());
        return cacheManager;
    }
}

