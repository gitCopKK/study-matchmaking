package com.studymatch.repository;

import com.studymatch.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
    
    // Find sessions where user is creator, partner, or member of the session's group
    @Query("SELECT DISTINCT s FROM StudySession s " +
           "LEFT JOIN s.studyGroup g " +
           "LEFT JOIN g.members m " +
           "WHERE s.creator.id = :userId OR s.partner.id = :userId OR m.user.id = :userId " +
           "ORDER BY s.scheduledAt DESC")
    List<StudySession> findByUserId(UUID userId);
    
    // Find upcoming sessions (including group sessions) - excludes cancelled sessions
    @Query("SELECT DISTINCT s FROM StudySession s " +
           "LEFT JOIN s.studyGroup g " +
           "LEFT JOIN g.members m " +
           "WHERE (s.creator.id = :userId OR s.partner.id = :userId OR m.user.id = :userId) " +
           "AND s.scheduledAt > :now AND s.status <> 'CANCELLED' " +
           "ORDER BY s.scheduledAt ASC")
    List<StudySession> findUpcomingSessions(UUID userId, LocalDateTime now);
    
    @Query("SELECT s FROM StudySession s WHERE s.scheduledAt BETWEEN :start AND :end AND s.status = 'SCHEDULED'")
    List<StudySession> findSessionsToRemind(LocalDateTime start, LocalDateTime end);
    
    // Leaderboard: Most sessions completed (including group sessions)
    @Query("SELECT u.id, COUNT(DISTINCT s) as sessionCount FROM StudySession s " +
           "LEFT JOIN s.studyGroup g " +
           "LEFT JOIN g.members m " +
           "JOIN User u ON (s.creator.id = u.id OR s.partner.id = u.id OR m.user.id = u.id) " +
           "WHERE s.status = 'COMPLETED' " +
           "GROUP BY u.id ORDER BY sessionCount DESC")
    List<Object[]> findMostSessionsCompleted();
    
    // Count sessions for a user within a date range (for dashboard stats)
    @Query("SELECT COUNT(DISTINCT s) FROM StudySession s " +
           "LEFT JOIN s.studyGroup g " +
           "LEFT JOIN g.members m " +
           "WHERE (s.creator.id = :userId OR s.partner.id = :userId OR m.user.id = :userId) " +
           "AND s.scheduledAt BETWEEN :startDateTime AND :endDateTime")
    Integer countSessionsInRange(UUID userId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    // Find expired sessions (scheduledAt + durationMinutes has passed)
    @Query("SELECT s FROM StudySession s WHERE FUNCTION('TIMESTAMPADD', MINUTE, s.durationMinutes, s.scheduledAt) < :now")
    List<StudySession> findExpiredSessions(LocalDateTime now);
    
    // Count completed sessions for a user (for badges)
    @Query("SELECT COUNT(DISTINCT s) FROM StudySession s " +
           "LEFT JOIN s.studyGroup g " +
           "LEFT JOIN g.members m " +
           "WHERE (s.creator.id = :userId OR s.partner.id = :userId OR m.user.id = :userId) " +
           "AND s.status = 'COMPLETED'")
    int countCompletedSessionsByUserId(UUID userId);
}

