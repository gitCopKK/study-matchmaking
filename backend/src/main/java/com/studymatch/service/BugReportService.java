package com.studymatch.service;

import com.studymatch.dto.BugReportDto;
import com.studymatch.dto.CreateBugReportRequest;
import com.studymatch.model.BugReport;
import com.studymatch.model.Notification;
import com.studymatch.model.User;
import com.studymatch.repository.BugReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BugReportService {

    private final BugReportRepository bugReportRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public BugReportDto createBugReport(CreateBugReportRequest request) {
        User currentUser = userService.getCurrentUser();

        BugReport bugReport = BugReport.builder()
                .reporter(currentUser)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(BugReport.BugCategory.valueOf(request.getCategory()))
                .browserInfo(request.getBrowserInfo())
                .pageUrl(request.getPageUrl())
                .build();

        bugReport = bugReportRepository.save(bugReport);
        return toDto(bugReport);
    }

    public Page<BugReportDto> getMyBugReports(int page) {
        User currentUser = userService.getCurrentUser();
        return bugReportRepository.findByReporterIdOrderByCreatedAtDesc(
                currentUser.getId(), PageRequest.of(page, 10)
        ).map(this::toDto);
    }

    // Admin methods
    public Page<BugReportDto> getAllBugReports(int page, String status) {
        if (status != null && !status.isEmpty()) {
            return bugReportRepository.findByStatusOrderByCreatedAtDesc(
                    BugReport.BugStatus.valueOf(status), PageRequest.of(page, 20)
            ).map(this::toDto);
        }
        return bugReportRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(page, 20)
        ).map(this::toDto);
    }

    @Transactional
    public BugReportDto updateBugReport(UUID id, String status, String priority, String adminNotes) {
        BugReport bugReport = bugReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug report not found"));

        boolean statusChanged = false;
        
        if (status != null) {
            BugReport.BugStatus newStatus = BugReport.BugStatus.valueOf(status);
            if (bugReport.getStatus() != newStatus) {
                statusChanged = true;
                bugReport.setStatus(newStatus);
                if (newStatus == BugReport.BugStatus.RESOLVED || newStatus == BugReport.BugStatus.CLOSED) {
                    bugReport.setResolvedAt(LocalDateTime.now());
                }
            }
        }
        if (priority != null) {
            bugReport.setPriority(BugReport.BugPriority.valueOf(priority));
        }
        if (adminNotes != null) {
            bugReport.setAdminNotes(adminNotes);
        }

        bugReport = bugReportRepository.save(bugReport);

        // Notify the reporter about status update
        if (statusChanged) {
            notificationService.createNotification(
                    bugReport.getReporter(),
                    Notification.NotificationType.SYSTEM,
                    "Your bug report \"" + bugReport.getTitle() + "\" status changed to " + status,
                    "/settings"
            );
        }

        return toDto(bugReport);
    }

    public Map<String, Object> getBugReportStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", bugReportRepository.count());
        stats.put("open", bugReportRepository.countByStatus(BugReport.BugStatus.OPEN));
        stats.put("inProgress", bugReportRepository.countByStatus(BugReport.BugStatus.IN_PROGRESS));
        stats.put("resolved", bugReportRepository.countByStatus(BugReport.BugStatus.RESOLVED));
        stats.put("closed", bugReportRepository.countByStatus(BugReport.BugStatus.CLOSED));
        return stats;
    }

    private BugReportDto toDto(BugReport bugReport) {
        // Handle case where reporter may have been deleted
        User reporter = null;
        try {
            reporter = bugReport.getReporter();
        } catch (Exception e) {
            // Reporter no longer exists
        }
        
        return BugReportDto.builder()
                .id(bugReport.getId())
                .reporterId(reporter != null ? reporter.getId() : null)
                .reporterName(reporter != null ? reporter.getDisplayName() : "Deleted User")
                .reporterEmail(reporter != null ? reporter.getEmail() : null)
                .title(bugReport.getTitle())
                .description(bugReport.getDescription())
                .category(bugReport.getCategory().name())
                .status(bugReport.getStatus().name())
                .priority(bugReport.getPriority().name())
                .browserInfo(bugReport.getBrowserInfo())
                .pageUrl(bugReport.getPageUrl())
                .adminNotes(bugReport.getAdminNotes())
                .createdAt(bugReport.getCreatedAt())
                .resolvedAt(bugReport.getResolvedAt())
                .build();
    }
}

