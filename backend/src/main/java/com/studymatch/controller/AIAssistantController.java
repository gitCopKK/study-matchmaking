package com.studymatch.controller;

import com.studymatch.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI Assistant REST Controller - Stub endpoints for future AI integration.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(Map.of("enabled", aiAssistantService.isEnabled()));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(@RequestBody Map<String, Boolean> request) {
        boolean enabled = request.getOrDefault("enabled", false);
        aiAssistantService.setEnabled(enabled);
        return ResponseEntity.ok(Map.of("enabled", aiAssistantService.isEnabled()));
    }

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explainConcept(@RequestBody Map<String, Object> request) {
        String topic = (String) request.get("topic");
        @SuppressWarnings("unchecked")
        Map<String, String> context = (Map<String, String>) request.getOrDefault("context", Map.of());
        
        String explanation = aiAssistantService.explainConcept(topic, context);
        return ResponseEntity.ok(Map.of("explanation", explanation));
    }

    @PostMapping("/quiz")
    public ResponseEntity<List<Map<String, Object>>> generateQuiz(@RequestBody Map<String, Object> request) {
        String topic = (String) request.get("topic");
        int numberOfQuestions = (int) request.getOrDefault("numberOfQuestions", 5);
        
        List<Map<String, Object>> quiz = aiAssistantService.generateQuiz(topic, numberOfQuestions);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/flashcards")
    public ResponseEntity<List<Map<String, String>>> generateFlashcards(@RequestBody Map<String, Object> request) {
        String topic = (String) request.get("topic");
        int numberOfCards = (int) request.getOrDefault("numberOfCards", 10);
        
        List<Map<String, String>> flashcards = aiAssistantService.generateFlashcards(topic, numberOfCards);
        return ResponseEntity.ok(flashcards);
    }

    @PostMapping("/study-plan")
    public ResponseEntity<Map<String, Object>> generateStudyPlan(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> subjects = (List<String>) request.get("subjects");
        int availableHours = (int) request.getOrDefault("availableHours", 4);
        int durationDays = (int) request.getOrDefault("durationDays", 7);
        
        Map<String, Object> plan = aiAssistantService.generateStudyPlan(subjects, availableHours, durationDays);
        return ResponseEntity.ok(plan);
    }

    @PostMapping("/resources")
    public ResponseEntity<List<Map<String, String>>> getResourceRecommendations(@RequestBody Map<String, String> request) {
        String topic = request.get("topic");
        
        List<Map<String, String>> resources = aiAssistantService.getResourceRecommendations(topic);
        return ResponseEntity.ok(resources);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        @SuppressWarnings("unchecked")
        List<Map<String, String>> history = (List<Map<String, String>>) request.getOrDefault("history", List.of());
        
        String response = aiAssistantService.chat(message, history);
        return ResponseEntity.ok(Map.of("response", response));
    }
}

