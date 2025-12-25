package com.studymatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.config.AIConfig;
import com.studymatch.config.CacheConfiguration;
import com.studymatch.model.Profile;
import com.studymatch.model.TokenUsage;
import com.studymatch.model.User;
import com.studymatch.repository.TokenUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;

/**
 * AI-powered matching service using Groq API for intelligent study partner matching.
 * 
 * Features:
 * - Semantic subject understanding (Physics ≈ Mechanics)
 * - Personalized match explanations
 * - Complementary skills matching (strengths/weaknesses)
 * - Smart study recommendations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIMatchingService {
    
    private final AIConfig aiConfig;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;
    private final TokenUsageRepository tokenUsageRepository;
    
    /**
     * Result of AI-enhanced matching analysis.
     */
    public record AIMatchResult(
        int adjustedScore,
        String personalizedReason,
        List<String> studyRecommendations,
        double semanticSimilarity
    ) {}
    
    /**
     * Check if AI matching is available (enabled and API key configured).
     */
    public boolean isAvailable() {
        boolean enabled = aiConfig.isEnabled();
        boolean hasKey = aiConfig.getGroq().getApiKey() != null && !aiConfig.getGroq().getApiKey().isBlank();
        return enabled && hasKey;
    }
    
    /**
     * Analyze compatibility between two profiles using AI.
     * Results are cached to minimize API calls.
     * 
     * @param currentProfile The current user's profile
     * @param candidateProfile The potential match's profile
     * @param candidateDisplayName Display name for personalized messaging
     * @param baseScore The rule-based compatibility score (0-100)
     * @return AI-enhanced match result with adjusted score and personalized reason
     */
    @Cacheable(value = CacheConfiguration.AI_MATCH_CACHE, 
               key = "#currentProfile.id + '-' + #candidateProfile.id",
               condition = "#root.target.isAvailable()")
    public AIMatchResult analyzeCompatibility(
            Profile currentProfile, 
            Profile candidateProfile,
            String candidateDisplayName,
            int baseScore) {
        
        if (!isAvailable()) {
            log.debug("AI matching not available, returning base score");
            return new AIMatchResult(baseScore, null, List.of(), 0.0);
        }
        
        try {
            String prompt = buildAnalysisPrompt(currentProfile, candidateProfile, candidateDisplayName);
            String response = callGroqAPI(prompt);
            return parseAIResponse(response, baseScore, currentProfile.getUser());
        } catch (Exception e) {
            log.warn("AI matching failed, falling back to rule-based: {}", e.getMessage());
            return new AIMatchResult(baseScore, null, List.of(), 0.0);
        }
    }
    
    /**
     * Batch analyze multiple candidates for efficiency.
     */
    public Map<UUID, AIMatchResult> batchAnalyze(
            Profile currentProfile,
            Map<UUID, Profile> candidateProfiles,
            Map<UUID, String> displayNames,
            Map<UUID, Integer> baseScores) {
        
        Map<UUID, AIMatchResult> results = new HashMap<>();
        
        // Process in parallel for better performance
        candidateProfiles.entrySet().parallelStream().forEach(entry -> {
            UUID candidateId = entry.getKey();
            Profile candidateProfile = entry.getValue();
            String displayName = displayNames.getOrDefault(candidateId, "Study Partner");
            int baseScore = baseScores.getOrDefault(candidateId, 50);
            
            AIMatchResult result = analyzeCompatibility(
                currentProfile, candidateProfile, displayName, baseScore);
            
            synchronized (results) {
                results.put(candidateId, result);
            }
        });
        
        return results;
    }
    
    private String buildAnalysisPrompt(Profile p1, Profile p2, String p2Name) {
        // Shortened prompt to reduce token usage (~40% reduction)
        StringBuilder prompt = new StringBuilder();
        prompt.append("Rate study partner match. JSON only.\n\n");
        
        prompt.append("A: ").append(formatList(p1.getSubjects()));
        prompt.append("|").append(nullSafe(p1.getLearningStyle()));
        prompt.append("|").append(nullSafe(p1.getExamGoal()));
        prompt.append("|").append(formatList(p1.getPreferredTimes())).append("\n");
        
        prompt.append("B(").append(p2Name).append("): ").append(formatList(p2.getSubjects()));
        prompt.append("|").append(nullSafe(p2.getLearningStyle()));
        prompt.append("|").append(nullSafe(p2.getExamGoal()));
        prompt.append("|").append(formatList(p2.getPreferredTimes())).append("\n\n");
        
        prompt.append("{\"score_adjustment\":<-20 to +20>,\"semantic_similarity\":<0-1>,");
        prompt.append("\"personalized_reason\":\"<1 sentence>\",\"study_recommendations\":[\"topic1\",\"topic2\"]}");
        
        return prompt.toString();
    }
    
    private String callGroqAPI(String prompt) {
        WebClient webClient = webClientBuilder.build();
        
        Map<String, Object> message = Map.of(
            "role", "user",
            "content", prompt
        );
        
        Map<String, Object> requestBody = Map.of(
            "model", aiConfig.getGroq().getModel(),
            "messages", List.of(message),
            "max_tokens", aiConfig.getGroq().getMaxTokens(),
            "temperature", aiConfig.getGroq().getTemperature(),
            "response_format", Map.of("type", "json_object")
        );
        
        try {
            String response = webClient.post()
                .uri(aiConfig.getGroq().getApiUrl())
                .header("Authorization", "Bearer " + aiConfig.getGroq().getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.debug("Groq API response received");
            return response;
            
        } catch (WebClientResponseException e) {
            log.error("Groq API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("AI API call failed: " + e.getMessage());
        }
    }
    
    private AIMatchResult parseAIResponse(String response, int baseScore, User user) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode choices = root.get("choices");
            
            if (choices == null || choices.isEmpty()) {
                return new AIMatchResult(baseScore, null, List.of(), 0.0);
            }
            
            // Track token usage
            if (root.has("usage") && user != null) {
                JsonNode usage = root.get("usage");
                int promptTokens = usage.has("prompt_tokens") ? usage.get("prompt_tokens").asInt() : 0;
                int completionTokens = usage.has("completion_tokens") ? usage.get("completion_tokens").asInt() : 0;
                int totalTokens = usage.has("total_tokens") ? usage.get("total_tokens").asInt() : 0;
                
                TokenUsage tokenUsage = TokenUsage.builder()
                    .user(user)
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .totalTokens(totalTokens)
                    .operation("match_analysis")
                    .build();
                tokenUsageRepository.save(tokenUsage);
                log.debug("Tracked token usage: {} tokens for user {}", totalTokens, user.getId());
            }
            
            String content = choices.get(0).get("message").get("content").asText();
            JsonNode aiResult = objectMapper.readTree(content);
            
            int scoreAdjustment = aiResult.has("score_adjustment") 
                ? aiResult.get("score_adjustment").asInt() : 0;
            
            double semanticSimilarity = aiResult.has("semantic_similarity")
                ? aiResult.get("semantic_similarity").asDouble() : 0.0;
            
            String personalizedReason = aiResult.has("personalized_reason")
                ? aiResult.get("personalized_reason").asText() : null;
            
            List<String> recommendations = new ArrayList<>();
            if (aiResult.has("study_recommendations")) {
                aiResult.get("study_recommendations").forEach(node -> 
                    recommendations.add(node.asText()));
            }
            
            // Clamp adjusted score between 0 and 100
            int adjustedScore = Math.max(0, Math.min(100, baseScore + scoreAdjustment));
            
            return new AIMatchResult(adjustedScore, personalizedReason, recommendations, semanticSimilarity);
            
        } catch (Exception e) {
            log.warn("Failed to parse AI response: {}", e.getMessage());
            return new AIMatchResult(baseScore, null, List.of(), 0.0);
        }
    }
    
    private String formatList(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "Not specified";
        }
        return String.join(", ", list);
    }
    
    private String nullSafe(String value) {
        return value != null ? value : "Not specified";
    }
}

