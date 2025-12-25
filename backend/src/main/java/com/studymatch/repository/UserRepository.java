package com.studymatch.repository;

import com.studymatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.id != :userId AND u.profileComplete = true AND (u.deleted = false OR u.deleted IS NULL)")
    List<User> findAllExceptUser(UUID userId);
    
    @Query("SELECT u FROM User u WHERE u.isOnline = true AND u.id != :userId AND (u.deleted = false OR u.deleted IS NULL)")
    List<User> findOnlineUsers(UUID userId);
    
    @Query("SELECT u FROM User u WHERE u.id != :userId AND (u.deleted = false OR u.deleted IS NULL) AND " +
           "((u.username IS NOT NULL AND LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("userId") UUID userId, @Param("query") String query);
}

