package com.studymatch.controller;

import com.studymatch.dto.AuthResponse;
import com.studymatch.dto.UserSearchDto;
import com.studymatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserDto());
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse.UserDto> updateUser(@RequestBody Map<String, String> updates) {
        String displayName = updates.get("displayName");
        return ResponseEntity.ok(userService.updateUser(displayName));
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        userService.changePassword(currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
    
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}

