package com.studymatch.repository;

import com.studymatch.model.TokenUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TokenUsageRepository extends JpaRepository<TokenUsage, UUID> {
    
    @Query("SELECT SUM(t.totalTokens) FROM TokenUsage t")
    Long getTotalTokensUsed();
    
    @Query("SELECT SUM(t.totalTokens) FROM TokenUsage t WHERE t.createdAt >= :since")
    Long getTotalTokensUsedSince(LocalDateTime since);
    
    @Query("SELECT t.user.id, t.user.displayName, SUM(t.totalTokens) as total " +
           "FROM TokenUsage t GROUP BY t.user.id, t.user.displayName ORDER BY total DESC")
    List<Object[]> getTokenUsageByUser();
    
    @Query("SELECT t.user.id, t.user.displayName, SUM(t.totalTokens) as total " +
           "FROM TokenUsage t WHERE t.createdAt >= :since " +
           "GROUP BY t.user.id, t.user.displayName ORDER BY total DESC")
    List<Object[]> getTokenUsageByUserSince(LocalDateTime since);
    
    List<TokenUsage> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    @Query("SELECT DATE(t.createdAt), SUM(t.totalTokens) " +
           "FROM TokenUsage t WHERE t.createdAt >= :since " +
           "GROUP BY DATE(t.createdAt) ORDER BY DATE(t.createdAt)")
    List<Object[]> getDailyTokenUsage(LocalDateTime since);
}

