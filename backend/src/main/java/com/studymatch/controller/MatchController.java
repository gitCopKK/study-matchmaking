package com.studymatch.controller;

import com.studymatch.dto.MatchDto;
import com.studymatch.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    @GetMapping("/suggestions")
    public ResponseEntity<List<MatchDto>> getSuggestions() {
        return ResponseEntity.ok(matchingService.getSuggestions());
    }

    @GetMapping
    public ResponseEntity<List<MatchDto>> getMatches() {
        return ResponseEntity.ok(matchingService.getMutualMatches());
    }

    @PostMapping("/{matchId}/accept")
    public ResponseEntity<MatchDto> acceptMatch(@PathVariable UUID matchId) {
        return ResponseEntity.ok(matchingService.acceptMatch(matchId));
    }

    @PostMapping("/{matchId}/decline")
    public ResponseEntity<Void> declineMatch(@PathVariable UUID matchId) {
        matchingService.declineMatch(matchId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<List<MatchDto>> refreshSuggestions() {
        matchingService.clearPendingMatches();
        return ResponseEntity.ok(matchingService.getSuggestions());
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> removeMatchByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "true") boolean deleteChat) {
        matchingService.removeMatchWithUser(userId, deleteChat);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/request/{userId}")
    public ResponseEntity<MatchDto> sendMatchRequest(@PathVariable UUID userId) {
        return ResponseEntity.ok(matchingService.sendMatchRequest(userId));
    }
    
    @GetMapping("/requests")
    public ResponseEntity<List<MatchDto>> getPendingRequests() {
        return ResponseEntity.ok(matchingService.getPendingRequests());
    }
}

