package com.studymatch.repository;

import com.studymatch.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(UUID userId);
    
    Optional<UserBadge> findByUserIdAndBadgeId(UUID userId, UUID badgeId);
    
    boolean existsByUserIdAndBadgeId(UUID userId, UUID badgeId);
    
    @Query("SELECT ub FROM UserBadge ub WHERE ub.user.id = :userId AND ub.seen = false ORDER BY ub.earnedAt DESC")
    List<UserBadge> findUnseenBadges(UUID userId);
    
    @Query("SELECT COUNT(ub) FROM UserBadge ub WHERE ub.user.id = :userId")
    Integer countByUserId(UUID userId);
    
    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findByUserIdWithBadge(UUID userId);
}

