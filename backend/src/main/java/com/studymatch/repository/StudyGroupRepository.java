package com.studymatch.repository;

import com.studymatch.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, UUID> {
    
    @Query("SELECT g FROM StudyGroup g JOIN g.members m WHERE m.user.id = :userId")
    List<StudyGroup> findByUserId(UUID userId);
    
    @Query("SELECT g FROM StudyGroup g WHERE g.createdBy.id = :userId")
    List<StudyGroup> findCreatedByUserId(UUID userId);
}

