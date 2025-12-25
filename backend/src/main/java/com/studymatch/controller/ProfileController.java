package com.studymatch.controller;

import com.studymatch.dto.ProfileDto;
import com.studymatch.service.AdminService;
import com.studymatch.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final AdminService adminService;

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileDto> updateMyProfile(@RequestBody ProfileDto.UpdateRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileDto> getProfileByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }
    
    /**
     * Get profile options (subjects, study goals) for dropdowns
     */
    @GetMapping("/options")
    public ResponseEntity<Map<String, List<String>>> getProfileOptions() {
        return ResponseEntity.ok(adminService.getProfileOptions());
    }
}

