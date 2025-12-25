package com.studymatch.websocket;

import com.studymatch.model.User;
import com.studymatch.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
public class VideoSignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    
    // Helper to get user from Principal (WebSocket-safe, doesn't use SecurityContextHolder)
    private User getUserFromPrincipal(Principal principal) {
        if (principal instanceof Authentication auth) {
            Object p = auth.getPrincipal();
            if (p instanceof UserDetails userDetails) {
                return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            }
        }
        throw new RuntimeException("Cannot get user from principal");
    }
    
    // Track users in each room
    private final Map<String, ConcurrentHashMap<String, String>> roomUsers = new ConcurrentHashMap<>();

    @Data
    public static class SignalMessage {
        private String type;
        private String roomId;
        private Object offer;
        private Object answer;
        private Object candidate;
    }

    @MessageMapping("/video.join/{roomId}")
    public void joinRoom(@DestinationVariable String roomId, Principal principal) {
        User user = getUserFromPrincipal(principal);
        String userId = user.getId().toString();
        String displayName = user.getDisplayName();
        
        // Add user to room
        roomUsers.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(userId, displayName);
        
        // Notify others in the room
        messagingTemplate.convertAndSend("/topic/video/" + roomId, Map.of(
            "type", "user-joined",
            "userId", userId,
            "displayName", displayName
        ));
    }

    @MessageMapping("/video.leave/{roomId}")
    public void leaveRoom(@DestinationVariable String roomId, Principal principal) {
        User user = getUserFromPrincipal(principal);
        String userId = user.getId().toString();
        
        // Remove user from room
        ConcurrentHashMap<String, String> users = roomUsers.get(roomId);
        if (users != null) {
            users.remove(userId);
            if (users.isEmpty()) {
                roomUsers.remove(roomId);
            }
        }
        
        // Notify others
        messagingTemplate.convertAndSend("/topic/video/" + roomId, Map.of(
            "type", "user-left",
            "userId", userId
        ));
    }

    @MessageMapping("/video.offer/{roomId}")
    public void sendOffer(@DestinationVariable String roomId, @Payload Map<String, Object> payload, Principal principal) {
        User user = getUserFromPrincipal(principal);
        String userId = user.getId().toString();
        payload.put("type", "offer");
        payload.put("userId", userId);
        messagingTemplate.convertAndSend("/topic/video/" + roomId, payload);
    }

    @MessageMapping("/video.answer/{roomId}")
    public void sendAnswer(@DestinationVariable String roomId, @Payload Map<String, Object> payload, Principal principal) {
        User user = getUserFromPrincipal(principal);
        String userId = user.getId().toString();
        payload.put("type", "answer");
        payload.put("userId", userId);
        messagingTemplate.convertAndSend("/topic/video/" + roomId, payload);
    }

    @MessageMapping("/video.ice/{roomId}")
    public void sendIceCandidate(@DestinationVariable String roomId, @Payload Map<String, Object> payload, Principal principal) {
        User user = getUserFromPrincipal(principal);
        String userId = user.getId().toString();
        payload.put("type", "ice-candidate");
        payload.put("userId", userId);
        messagingTemplate.convertAndSend("/topic/video/" + roomId, payload);
    }
}
