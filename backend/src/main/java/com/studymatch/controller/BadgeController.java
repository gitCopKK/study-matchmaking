package com.studymatch.controller;

import com.studymatch.dto.BadgeDto;
import com.studymatch.model.User;
import com.studymatch.service.BadgeService;
import com.studymatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<BadgeDto.BadgeListResponse> getBadges() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(badgeService.getBadges(currentUser));
    }

    @GetMapping("/earned")
    public ResponseEntity<List<BadgeDto>> getEarnedBadges() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(badgeService.getEarnedBadges(currentUser));
    }

    @GetMapping("/unseen")
    public ResponseEntity<List<BadgeDto.NewBadgeNotification>> getUnseenBadges() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(badgeService.getUnseenBadges(currentUser));
    }

    @PostMapping("/mark-seen")
    public ResponseEntity<Void> markBadgesAsSeen() {
        User currentUser = userService.getCurrentUser();
        badgeService.markBadgesAsSeen(currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BadgeDto>> getUserBadges(@PathVariable UUID userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(badgeService.getEarnedBadges(user));
    }
}

