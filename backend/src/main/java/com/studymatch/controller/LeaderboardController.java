package com.studymatch.controller;

import com.studymatch.dto.LeaderboardDto;
import com.studymatch.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<LeaderboardDto> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }
}

