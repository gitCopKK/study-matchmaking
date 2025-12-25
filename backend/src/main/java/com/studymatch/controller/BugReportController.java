package com.studymatch.controller;

import com.studymatch.dto.BugReportDto;
import com.studymatch.dto.CreateBugReportRequest;
import com.studymatch.service.BugReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bug-reports")
@RequiredArgsConstructor
public class BugReportController {

    private final BugReportService bugReportService;

    // User endpoints
    @PostMapping
    public ResponseEntity<BugReportDto> createBugReport(@Valid @RequestBody CreateBugReportRequest request) {
        return ResponseEntity.ok(bugReportService.createBugReport(request));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Page<BugReportDto>> getMyBugReports(
            @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(bugReportService.getMyBugReports(page));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BugReportDto>> getAllBugReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bugReportService.getAllBugReports(page, status));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBugReportStats() {
        return ResponseEntity.ok(bugReportService.getBugReportStats());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BugReportDto> updateBugReport(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(bugReportService.updateBugReport(
                id,
                body.get("status"),
                body.get("priority"),
                body.get("adminNotes")
        ));
    }
}

