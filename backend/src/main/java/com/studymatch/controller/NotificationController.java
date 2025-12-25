package com.studymatch.controller;

import com.studymatch.dto.NotificationDto;
import com.studymatch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
        @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(notificationService.getNotifications(page));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount()));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}

