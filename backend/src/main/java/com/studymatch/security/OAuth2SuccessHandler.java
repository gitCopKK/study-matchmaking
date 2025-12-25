package com.studymatch.security;

import com.studymatch.model.Profile;
import com.studymatch.model.User;
import com.studymatch.repository.ProfileRepository;
import com.studymatch.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JwtService jwtService;

    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        
        log.info("OAuth2 login success for email: {}", email);
        
        // Find existing user or create new one
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> createNewUser(email, name, googleId));
        
        // Update Google ID if not set (for account linking)
        if (user.getGoogleId() == null && googleId != null) {
            user.setGoogleId(googleId);
            userRepository.save(user);
            log.info("Linked Google account to existing user: {}", email);
        }
        
        // Generate JWT tokens
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password("")
            .authorities("ROLE_" + user.getRole().name())
            .build();
        
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        // Redirect to frontend with tokens
        String redirectUrl = UriComponentsBuilder.fromUriString(FRONTEND_URL + "/auth/google/callback")
            .queryParam("token", token)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();
        
        log.info("Redirecting to: {}", FRONTEND_URL + "/auth/google/callback");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
    
    private User createNewUser(String email, String name, String googleId) {
        log.info("Creating new user from Google OAuth: {}", email);
        
        User user = User.builder()
            .email(email)
            .displayName(name != null ? name : email.split("@")[0])
            .passwordHash("") // No password for OAuth users
            .googleId(googleId)
            .profileComplete(false)
            .build();
        
        user = userRepository.save(user);
        
        // Create empty profile
        Profile profile = Profile.builder()
            .user(user)
            .build();
        profileRepository.save(profile);
        
        return user;
    }
}

