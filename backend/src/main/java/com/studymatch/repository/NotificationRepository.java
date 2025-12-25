package com.studymatch.repository;

import com.studymatch.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false")
    long countUnread(UUID userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllAsRead(UUID userId);
}

