package com.studymatch.repository;

import com.studymatch.model.BugReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BugReportRepository extends JpaRepository<BugReport, UUID> {
    
    Page<BugReport> findByReporterIdOrderByCreatedAtDesc(UUID reporterId, Pageable pageable);
    
    Page<BugReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    Page<BugReport> findByStatusOrderByCreatedAtDesc(BugReport.BugStatus status, Pageable pageable);
    
    long countByStatus(BugReport.BugStatus status);
}

