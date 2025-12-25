package com.studymatch.security;

import com.studymatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Check if user is deleted
        if (Boolean.TRUE.equals(user.getDeleted())) {
            throw new UsernameNotFoundException("This account has been deleted");
        }
        
        // Check if user is blocked
        if (Boolean.TRUE.equals(user.getBlocked())) {
            throw new UsernameNotFoundException("User account is blocked: " + user.getBlockedReason());
        }
        
        // Add role as authority
        String role = "ROLE_" + user.getRole().name();
        
        // Handle OAuth users who don't have a password
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "";
        
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            password,
            List.of(new SimpleGrantedAuthority(role))
        );
    }
}

