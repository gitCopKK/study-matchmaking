package com.studymatch.controller;

import com.studymatch.dto.SessionDto;
import com.studymatch.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<List<SessionDto>> getSessions() {
        return ResponseEntity.ok(sessionService.getSessions());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SessionDto>> getUpcomingSessions() {
        return ResponseEntity.ok(sessionService.getUpcomingSessions());
    }

    @PostMapping
    public ResponseEntity<SessionDto> createSession(@RequestBody SessionDto.CreateRequest request) {
        return ResponseEntity.ok(sessionService.createSession(request));
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<SessionDto> updateSession(
        @PathVariable UUID sessionId,
        @RequestBody SessionDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(sessionService.updateSession(sessionId, request));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID sessionId) {
        sessionService.deleteSession(sessionId);
        return ResponseEntity.ok().build();
    }
}

