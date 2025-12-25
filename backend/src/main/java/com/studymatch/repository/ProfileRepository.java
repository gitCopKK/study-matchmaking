package com.studymatch.repository;

import com.studymatch.model.Profile;
import com.studymatch.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    
    Optional<Profile> findByUser(User user);
    
    Optional<Profile> findByUserId(UUID userId);
    
    // Leaderboard: Top streaks
    @Query("SELECT p FROM Profile p WHERE p.studyStreak > 0 ORDER BY p.studyStreak DESC")
    List<Profile> findTopStreaks(Pageable pageable);
}

