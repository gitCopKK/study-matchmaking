package com.studymatch.config;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.SSLException;

/**
 * WebClient configuration with SSL handling for Groq API calls.
 * 
 * In development, if SSL verification fails (e.g., corporate proxy),
 * set app.ai.groq.skip-ssl-verification=true
 */
@Configuration
@Slf4j
public class WebClientConfig {
    
    @Value("${app.ai.groq.skip-ssl-verification:false}")
    private boolean skipSslVerification;
    
    @Bean
    public WebClient.Builder webClientBuilder() {
        WebClient.Builder builder = WebClient.builder();
        
        if (skipSslVerification) {
            log.warn("SSL verification disabled for AI API calls - DO NOT USE IN PRODUCTION");
            try {
                SslContext sslContext = SslContextBuilder.forClient()
                    .trustManager(InsecureTrustManagerFactory.INSTANCE)
                    .build();
                
                HttpClient httpClient = HttpClient.create()
                    .secure(spec -> spec.sslContext(sslContext));
                
                builder.clientConnector(new ReactorClientHttpConnector(httpClient));
            } catch (SSLException e) {
                log.error("Failed to configure insecure SSL context: {}", e.getMessage());
            }
        }
        
        return builder;
    }
}

