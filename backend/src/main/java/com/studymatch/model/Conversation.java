package com.studymatch.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToMany
    @JoinTable(
        name = "conversation_participants",
        joinColumns = @JoinColumn(name = "conversation_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> participants = new ArrayList<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    @OrderBy("sentAt DESC")
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_group_id")
    private StudyGroup studyGroup;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

