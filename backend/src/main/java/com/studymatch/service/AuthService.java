package com.studymatch.service;

import com.studymatch.dto.AuthRequest;
import com.studymatch.dto.AuthResponse;
import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.UserRepository;
import com.studymatch.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(AuthRequest.Register request) {
        // Check if user already exists
        var existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Check if this is an OAuth-only user (no password set)
            if (user.getGoogleId() != null && (user.getPasswordHash() == null || user.getPasswordHash().isEmpty())) {
                throw new RuntimeException("OAUTH_USER:This email is linked to Google. Please use 'Continue with Google' to sign in.");
            }
            throw new RuntimeException("Email already registered. Please sign in instead.");
        }

        // Generate unique username
        String username = generateUsername(request.getDisplayName());

        User user = User.builder()
            .email(request.getEmail())
            .username(username)
            .displayName(request.getDisplayName())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .profileComplete(false)
            .build();

        user = userRepository.save(user);

        // Create profile with registration data
        Profile.ProfileBuilder profileBuilder = Profile.builder()
            .user(user);

        boolean hasProfileData = false;

        // Add subjects if provided
        if (request.getSubjects() != null && !request.getSubjects().isEmpty()) {
            profileBuilder.subjects(request.getSubjects());
            hasProfileData = true;
        }

        // Add preferred times if provided
        if (request.getPreferredTimes() != null && !request.getPreferredTimes().isEmpty()) {
            profileBuilder.preferredTimes(request.getPreferredTimes());
        }

        // Add exam goal if provided
        if (request.getExamGoal() != null && !request.getExamGoal().isEmpty()) {
            profileBuilder.examGoal(request.getExamGoal());
        }

        // Add learning style if provided
        if (request.getLearningStyle() != null && !request.getLearningStyle().isEmpty()) {
            profileBuilder.learningStyle(request.getLearningStyle());
            hasProfileData = true;
        }

        // Add bio if provided
        if (request.getBio() != null && !request.getBio().isEmpty()) {
            profileBuilder.bio(request.getBio());
        }

        Profile profile = profileBuilder.build();
        profileRepository.save(profile);

        // Mark profile as complete if we have essential profile data
        if (hasProfileData) {
            user.setProfileComplete(true);
            user = userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(toUserDto(user))
            .build();
    }

    public AuthResponse login(AuthRequest.Login request) {
        // First check if user exists and if they're an OAuth-only user
        var existingUser = userRepository.findByUsername(request.getUsername());
        if (existingUser.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }
        
        User user = existingUser.get();
        
        // Check if this is an OAuth-only user (no password set)
        if (user.getGoogleId() != null && (user.getPasswordHash() == null || user.getPasswordHash().isEmpty())) {
            throw new RuntimeException("OAUTH_USER:This account uses Google Sign-In. Please click 'Continue with Google' to sign in.");
        }
        
        // Authenticate using email (Spring Security uses email as the principal)
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .user(toUserDto(user))
            .build();
    }

    public AuthResponse refresh(AuthRequest.RefreshToken request) {
        String username = jwtService.extractUsername(request.getRefreshToken());
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
            throw new RuntimeException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .refreshToken(newRefreshToken)
            .user(toUserDto(user))
            .build();
    }

    private AuthResponse.UserDto toUserDto(User user) {
        return AuthResponse.UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .username(user.getUsername())
            .displayName(user.getDisplayName())
            .profileComplete(user.getProfileComplete())
            .role(user.getRole().name())
            .build();
    }

    private String generateUsername(String displayName) {
        // Create base username from display name
        String base = displayName.toLowerCase()
            .replaceAll("[^a-z0-9]", "");
        
        if (base.isEmpty()) {
            base = "user";
        }
        
        base = base.substring(0, Math.min(base.length(), 15));
        
        String username = base;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = base + counter;
            counter++;
        }
        
        return username;
    }
}

