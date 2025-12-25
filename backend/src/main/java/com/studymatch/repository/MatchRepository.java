package com.studymatch.repository;

import com.studymatch.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    
    @Query("SELECT m FROM Match m WHERE (m.user1.id = :userId OR m.user2.id = :userId) AND m.status = 'MUTUAL' " +
           "AND (m.user1.deleted = false OR m.user1.deleted IS NULL) AND (m.user2.deleted = false OR m.user2.deleted IS NULL)")
    List<Match> findMutualMatches(UUID userId);
    
    @Query("SELECT m FROM Match m WHERE m.user1.id = :userId AND m.status = 'PENDING'")
    List<Match> findPendingSuggestions(UUID userId);
    
    @Query("SELECT m FROM Match m WHERE (m.user1.id = :userId1 AND m.user2.id = :userId2) OR (m.user1.id = :userId2 AND m.user2.id = :userId1)")
    Optional<Match> findMatchBetweenUsers(UUID userId1, UUID userId2);
    
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m WHERE (m.user1.id = :userId1 AND m.user2.id = :userId2) OR (m.user1.id = :userId2 AND m.user2.id = :userId1)")
    boolean existsBetweenUsers(UUID userId1, UUID userId2);
    
    @Modifying
    @Query("DELETE FROM Match m WHERE m.user1.id = :userId AND m.status = 'PENDING'")
    void deletePendingMatchesForUser(UUID userId);

    @Modifying
    @Query("DELETE FROM Match m WHERE (m.user1.id = :userId1 AND m.user2.id = :userId2) OR (m.user1.id = :userId2 AND m.user2.id = :userId1)")
    void deleteMatchesBetweenUsers(UUID userId1, UUID userId2);
    
    @Query("SELECT m FROM Match m WHERE m.user2.id = :userId AND m.status = 'PENDING' " +
           "AND (m.user1.deleted = false OR m.user1.deleted IS NULL)")
    List<Match> findPendingRequestsForUser(UUID userId);
    
    @Query("SELECT m FROM Match m WHERE " +
           "((m.user1.id = :senderId AND m.user2.id = :receiverId) OR " +
           "(m.user1.id = :receiverId AND m.user2.id = :senderId)) " +
           "AND m.status = 'DECLINED' " +
           "AND m.declinedAt > :since " +
           "ORDER BY m.declinedAt DESC")
    Optional<Match> findRecentDeclinedMatch(UUID senderId, UUID receiverId, LocalDateTime since);
    
    // Leaderboard: Most study partners (mutual matches count per user)
    @Query("SELECT u.id, COUNT(DISTINCT CASE WHEN m.user1.id = u.id THEN m.user2.id ELSE m.user1.id END) as partnerCount " +
           "FROM Match m JOIN User u ON (m.user1.id = u.id OR m.user2.id = u.id) " +
           "WHERE m.status = 'MUTUAL' " +
           "AND (u.deleted = false OR u.deleted IS NULL) " +
           "AND (m.user1.deleted = false OR m.user1.deleted IS NULL) " +
           "AND (m.user2.deleted = false OR m.user2.deleted IS NULL) " +
           "GROUP BY u.id ORDER BY partnerCount DESC")
    List<Object[]> findMostStudyPartners();
}

