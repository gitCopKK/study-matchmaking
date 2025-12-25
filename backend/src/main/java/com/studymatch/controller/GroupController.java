package com.studymatch.controller;

import com.studymatch.dto.GroupDto;
import com.studymatch.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDto>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDto> getGroup(@PathVariable UUID groupId) {
        return ResponseEntity.ok(groupService.getGroup(groupId));
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(@RequestBody GroupDto.CreateRequest request) {
        return ResponseEntity.ok(groupService.createGroup(request));
    }

    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<GroupDto> addMember(@PathVariable UUID groupId, @PathVariable UUID userId) {
        return ResponseEntity.ok(groupService.addMember(groupId, userId));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID groupId, @PathVariable UUID userId) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.ok().build();
    }
}

