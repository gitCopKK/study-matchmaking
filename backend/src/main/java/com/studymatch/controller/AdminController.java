package com.studymatch.controller;

import com.studymatch.config.AIConfig;
import com.studymatch.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final AIConfig aiConfig;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
    
    @GetMapping("/top-streaks")
    public ResponseEntity<List<Map<String, Object>>> getTopStreaks(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getTopStreakUsers(limit));
    }
    
    @GetMapping("/top-study-hours")
    public ResponseEntity<List<Map<String, Object>>> getTopStudyHours(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getTopStudyHoursUsers(limit));
    }
    
    @GetMapping("/token-usage")
    public ResponseEntity<List<Map<String, Object>>> getTokenUsage() {
        return ResponseEntity.ok(adminService.getTokenUsageByUser());
    }
    
    @GetMapping("/token-usage/daily")
    public ResponseEntity<List<Map<String, Object>>> getDailyTokenUsage(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminService.getDailyTokenUsage(days));
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @PostMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Blocked by admin");
        adminService.blockUser(userId, reason);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable UUID userId) {
        adminService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/activity-trends")
    public ResponseEntity<Map<String, Object>> getActivityTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminService.getActivityTrends(days));
    }
    
    @GetMapping("/engagement-analytics")
    public ResponseEntity<Map<String, Object>> getEngagementAnalytics(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(adminService.getEngagementAnalytics(days));
    }
    
    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(adminService.getRecentActivity(limit));
    }
    
    // ========== AI Settings Endpoints ==========
    
    @GetMapping("/ai-settings")
    public ResponseEntity<Map<String, Object>> getAISettings() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("enabled", aiConfig.isEnabled());
        settings.put("matchLimit", aiConfig.getMatchLimit());
        settings.put("model", aiConfig.getGroq().getModel());
        settings.put("maxTokens", aiConfig.getGroq().getMaxTokens());
        return ResponseEntity.ok(settings);
    }
    
    @PostMapping("/ai-settings/toggle")
    public ResponseEntity<Map<String, Object>> toggleAI(@RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        // Use the new method that persists to database
        aiConfig.setEnabledAndPersist(enabled);
        
        Map<String, Object> response = new HashMap<>();
        response.put("enabled", aiConfig.isEnabled());
        response.put("message", enabled ? "AI matching enabled" : "AI matching disabled");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/ai-settings/match-limit")
    public ResponseEntity<Map<String, Object>> setMatchLimit(@RequestBody Map<String, Integer> body) {
        int limit = body.getOrDefault("limit", 10);
        // Validate limit (min 1, max 50)
        limit = Math.max(1, Math.min(50, limit));
        // Use the new method that persists to database
        aiConfig.setMatchLimitAndPersist(limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("matchLimit", aiConfig.getMatchLimit());
        response.put("message", "AI match limit set to " + limit);
        return ResponseEntity.ok(response);
    }
    
    // ========== Profile Options Management ==========
    
    @GetMapping("/profile-options")
    public ResponseEntity<Map<String, List<String>>> getProfileOptions() {
        return ResponseEntity.ok(adminService.getProfileOptions());
    }
    
    @PostMapping("/profile-options/subjects")
    public ResponseEntity<List<String>> updateSubjects(@RequestBody Map<String, List<String>> body) {
        List<String> subjects = body.get("subjects");
        if (subjects == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.updateSubjects(subjects));
    }
    
    @PostMapping("/profile-options/subjects/add")
    public ResponseEntity<List<String>> addSubject(@RequestBody Map<String, String> body) {
        String subject = body.get("subject");
        if (subject == null || subject.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.addSubject(subject.trim()));
    }
    
    @PostMapping("/profile-options/subjects/remove")
    public ResponseEntity<List<String>> removeSubject(@RequestBody Map<String, String> body) {
        String subject = body.get("subject");
        if (subject == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.removeSubject(subject));
    }
    
    @PostMapping("/profile-options/study-goals")
    public ResponseEntity<List<String>> updateStudyGoals(@RequestBody Map<String, List<String>> body) {
        List<String> goals = body.get("studyGoals");
        if (goals == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.updateStudyGoals(goals));
    }
    
    @PostMapping("/profile-options/study-goals/add")
    public ResponseEntity<List<String>> addStudyGoal(@RequestBody Map<String, String> body) {
        String goal = body.get("goal");
        if (goal == null || goal.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.addStudyGoal(goal.trim()));
    }
    
    @PostMapping("/profile-options/study-goals/remove")
    public ResponseEntity<List<String>> removeStudyGoal(@RequestBody Map<String, String> body) {
        String goal = body.get("goal");
        if (goal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.removeStudyGoal(goal));
    }
}
