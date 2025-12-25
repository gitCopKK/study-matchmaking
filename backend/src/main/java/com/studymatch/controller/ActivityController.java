package com.studymatch.controller;

import com.studymatch.dto.ActivityDto;
import com.studymatch.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getActivities(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(activityService.getActivities(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<ActivityDto> logActivity(@RequestBody ActivityDto.CreateRequest request) {
        return ResponseEntity.ok(activityService.logActivity(request));
    }

    @GetMapping("/stats")
    public ResponseEntity<ActivityDto.Stats> getStats() {
        return ResponseEntity.ok(activityService.getStats());
    }
}

