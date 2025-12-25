package com.studymatch.repository;

import com.studymatch.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId AND a.activityDate BETWEEN :startDate AND :endDate ORDER BY a.activityDate DESC")
    List<Activity> findByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate);
    
    Optional<Activity> findByUserIdAndActivityDate(UUID userId, LocalDate date);
    
    @Query("SELECT COALESCE(SUM(a.studyMinutes), 0) FROM Activity a WHERE a.user.id = :userId AND a.activityDate BETWEEN :startDate AND :endDate")
    Integer sumStudyMinutes(UUID userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(DISTINCT a.activityDate) FROM Activity a WHERE a.user.id = :userId")
    Integer countActiveDays(UUID userId);
    
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId ORDER BY a.activityDate DESC")
    List<Activity> findRecentActivities(UUID userId);
    
    // Leaderboard: Top study hours this week
    @Query("SELECT a.user.id, SUM(a.studyMinutes) as total FROM Activity a WHERE a.activityDate BETWEEN :startDate AND :endDate GROUP BY a.user.id ORDER BY total DESC")
    List<Object[]> findTopStudyMinutesThisWeek(LocalDate startDate, LocalDate endDate);
    
    // Leaderboard: Most days active (all time)
    @Query("SELECT a.user.id, COUNT(DISTINCT a.activityDate) as days FROM Activity a GROUP BY a.user.id ORDER BY days DESC")
    List<Object[]> findMostDaysActive();
    
    // Leaderboard: Rising stars - study minutes by user in a date range
    @Query("SELECT a.user.id, COALESCE(SUM(a.studyMinutes), 0) FROM Activity a WHERE a.activityDate BETWEEN :startDate AND :endDate GROUP BY a.user.id")
    List<Object[]> findStudyMinutesByDateRange(LocalDate startDate, LocalDate endDate);
}

