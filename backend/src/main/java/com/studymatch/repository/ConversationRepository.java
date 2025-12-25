package com.studymatch.repository;

import com.studymatch.model.Conversation;
import com.studymatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(UUID userId);
    
    @Query("SELECT c FROM Conversation c WHERE SIZE(c.participants) = 2 AND :user1 MEMBER OF c.participants AND :user2 MEMBER OF c.participants")
    Optional<Conversation> findDirectConversation(User user1, User user2);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 WHERE p1.id = :userId1 AND p2.id = :userId2 AND SIZE(c.participants) = 2")
    Optional<Conversation> findConversationBetweenUsers(UUID userId1, UUID userId2);
}

