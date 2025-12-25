package com.studymatch.config;

import io.jsonwebtoken.io.Decoders;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * Validates security configuration on application startup.
 * Warns about insecure configurations in production environment.
 */
@Configuration
@Slf4j
public class SecurityConfigValidator {

    @Value("${app.jwt.secret}")
    private String jwtSecret;
    
    @Value("${app.ai.groq.skip-ssl-verification:false}")
    private boolean skipSslVerification;
    
    private final Environment environment;
    
    // Known development/weak secrets that should not be used in production
    private static final String[] WEAK_SECRETS = {
        "c3R1ZHltYXRjaHN1cGVyc2VjcmV0a2V5Zm9yMjU2Yml0c2VjdXJpdHk=", // studymatchsupersecretkeyfor256bitsecurity
        "CHANGE_THIS_IN_PRODUCTION"
    };
    
    public SecurityConfigValidator(Environment environment) {
        this.environment = environment;
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void validateSecurityConfig() {
        boolean isProduction = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        
        // Validate JWT Secret
        validateJwtSecret(isProduction);
        
        // Validate SSL settings
        validateSslSettings(isProduction);
        
        if (isProduction) {
            log.info("Production security validation completed");
        }
    }
    
    private void validateJwtSecret(boolean isProduction) {
        boolean isWeakSecret = Arrays.asList(WEAK_SECRETS).contains(jwtSecret);
        
        if (isWeakSecret) {
            String message = "SECURITY WARNING: Using a weak/default JWT secret. " +
                "Set the JWT_SECRET environment variable to a secure 256-bit base64-encoded key.";
            
            if (isProduction) {
                log.error("🚨 CRITICAL: " + message);
                throw new SecurityException(message + " Application startup blocked for security reasons.");
            } else {
                log.warn("⚠️  " + message);
            }
        }
        
        // Validate key length (should be at least 256 bits / 32 bytes for HMAC-SHA256)
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            if (keyBytes.length < 32) {
                String message = "JWT secret is too short. Minimum 256 bits (32 bytes) required for HMAC-SHA256.";
                if (isProduction) {
                    log.error("🚨 CRITICAL: " + message);
                    throw new SecurityException(message);
                } else {
                    log.warn("⚠️  " + message);
                }
            }
        } catch (IllegalArgumentException e) {
            String message = "JWT secret is not valid base64. Please provide a base64-encoded secret.";
            if (isProduction) {
                throw new SecurityException(message);
            } else {
                log.warn("⚠️  " + message);
            }
        }
    }
    
    private void validateSslSettings(boolean isProduction) {
        if (skipSslVerification) {
            String message = "SSL verification is disabled for AI API calls. This is a security risk.";
            
            if (isProduction) {
                log.error("🚨 CRITICAL: " + message + " Set SKIP_SSL_VERIFICATION=false for production.");
                throw new SecurityException(message + " Application startup blocked for security reasons.");
            } else {
                log.warn("⚠️  " + message + " Acceptable for development only.");
            }
        }
    }
}

