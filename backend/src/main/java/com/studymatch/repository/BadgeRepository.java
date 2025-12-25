package com.studymatch.repository;

import com.studymatch.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {
    
    Optional<Badge> findByCode(String code);
    
    List<Badge> findByCategory(String category);
    
    List<Badge> findAllByOrderByDisplayOrderAsc();
    
    boolean existsByCode(String code);
}

