package com.studymatch.repository;

import com.studymatch.model.Conversation;
import com.studymatch.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    Page<Message> findByConversationOrderBySentAtDesc(Conversation conversation, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessages(UUID conversationId, UUID userId);
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.status = 'READ', m.readAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markAllAsRead(UUID conversationId, UUID userId);
    
    // Find messages that haven't been delivered yet (for the recipient)
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :recipientId AND (m.status = 'SENT' OR m.status IS NULL)")
    List<Message> findUndeliveredMessages(UUID conversationId, UUID recipientId);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.conversation.id = :conversationId")
    void deleteByConversationId(UUID conversationId);
}

