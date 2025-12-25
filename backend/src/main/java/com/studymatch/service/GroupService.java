package com.studymatch.service;

import com.studymatch.dto.GroupDto;
import com.studymatch.model.GroupMember;
import com.studymatch.model.StudyGroup;
import com.studymatch.model.User;
import com.studymatch.repository.GroupMemberRepository;
import com.studymatch.repository.StudyGroupRepository;
import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final StudyGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public List<GroupDto> getMyGroups() {
        User currentUser = userService.getCurrentUser();
        List<StudyGroup> groups = groupRepository.findByUserId(currentUser.getId());
        
        // Also include groups created by the user
        List<StudyGroup> createdGroups = groupRepository.findCreatedByUserId(currentUser.getId());
        
        // Merge and deduplicate
        List<StudyGroup> allGroups = new ArrayList<>(groups);
        for (StudyGroup g : createdGroups) {
            if (allGroups.stream().noneMatch(existing -> existing.getId().equals(g.getId()))) {
                allGroups.add(g);
            }
        }
        
        return allGroups.stream().map(this::toDto).collect(Collectors.toList());
    }

    public GroupDto getGroup(UUID groupId) {
        StudyGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        return toDto(group);
    }

    @Transactional
    public GroupDto createGroup(GroupDto.CreateRequest request) {
        User currentUser = userService.getCurrentUser();
        
        StudyGroup group = StudyGroup.builder()
            .name(request.getName())
            .createdBy(currentUser)
            .maxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 6)
            .build();
        
        group = groupRepository.save(group);
        
        // Add creator as admin member
        GroupMember creatorMember = GroupMember.builder()
            .studyGroup(group)
            .user(currentUser)
            .role(GroupMember.MemberRole.ADMIN)
            .build();
        memberRepository.save(creatorMember);
        
        // Reload to get the member
        group = groupRepository.findById(group.getId()).orElseThrow();
        
        return toDto(group);
    }

    @Transactional
    public GroupDto addMember(UUID groupId, UUID userId) {
        User currentUser = userService.getCurrentUser();
        StudyGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        
        // Check if current user is admin
        boolean isAdmin = group.getCreatedBy().getId().equals(currentUser.getId()) ||
            group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()) && 
                          m.getRole() == GroupMember.MemberRole.ADMIN);
        
        if (!isAdmin) {
            throw new RuntimeException("Only group admins can add members");
        }
        
        // Check max members
        if (group.getMembers().size() >= group.getMaxMembers()) {
            throw new RuntimeException("Group has reached maximum members");
        }
        
        // Check if user is already a member
        boolean alreadyMember = group.getMembers().stream()
            .anyMatch(m -> m.getUser().getId().equals(userId));
        if (alreadyMember) {
            throw new RuntimeException("User is already a member of this group");
        }
        
        User newMember = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        GroupMember member = GroupMember.builder()
            .studyGroup(group)
            .user(newMember)
            .role(GroupMember.MemberRole.MEMBER)
            .build();
        memberRepository.save(member);
        
        // Reload group
        group = groupRepository.findById(groupId).orElseThrow();
        return toDto(group);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID userId) {
        User currentUser = userService.getCurrentUser();
        StudyGroup group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
        
        // Check if current user is admin or removing themselves
        boolean isAdmin = group.getCreatedBy().getId().equals(currentUser.getId()) ||
            group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()) && 
                          m.getRole() == GroupMember.MemberRole.ADMIN);
        boolean isSelf = currentUser.getId().equals(userId);
        
        if (!isAdmin && !isSelf) {
            throw new RuntimeException("Only group admins can remove members");
        }
        
        // Cannot remove the group creator
        if (group.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove the group creator");
        }
        
        GroupMember memberToRemove = group.getMembers().stream()
            .filter(m -> m.getUser().getId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("User is not a member of this group"));
        
        memberRepository.delete(memberToRemove);
    }

    private GroupDto toDto(StudyGroup group) {
        List<GroupDto.MemberDto> members = group.getMembers().stream()
            .map(m -> GroupDto.MemberDto.builder()
                .id(m.getUser().getId())
                .displayName(m.getUser().getDisplayName())
                .role(m.getRole().name())
                .build())
            .collect(Collectors.toList());
        
        return GroupDto.builder()
            .id(group.getId())
            .name(group.getName())
            .createdBy(GroupDto.MemberDto.builder()
                .id(group.getCreatedBy().getId())
                .displayName(group.getCreatedBy().getDisplayName())
                .role("CREATOR")
                .build())
            .maxMembers(group.getMaxMembers())
            .members(members)
            .createdAt(group.getCreatedAt())
            .build();
    }
}

