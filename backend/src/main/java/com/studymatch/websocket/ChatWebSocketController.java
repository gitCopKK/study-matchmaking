package com.studymatch.websocket;

import com.studymatch.dto.MessageDto;
import com.studymatch.model.User;
import com.studymatch.repository.UserRepository;
import com.studymatch.service.ChatService;
import com.studymatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
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

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDto.SendRequest request, Principal principal) {
        chatService.sendMessage(request.getConversationId(), request.getContent());
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload MessageDto.TypingRequest request, Principal principal) {
        chatService.sendTypingIndicator(request.getConversationId(), request.getIsTyping());
    }

    @MessageMapping("/presence")
    public void updatePresence(@Payload Map<String, Boolean> payload, Principal principal) {
        boolean online = payload.getOrDefault("online", false);
        
        // Use Principal to get user (WebSocket-safe, doesn't use SecurityContextHolder)
        User user = getUserFromPrincipal(principal);
        UUID userId = user.getId();
        
        userService.updateOnlineStatus(userId, online);
        
        // Broadcast presence update
        messagingTemplate.convertAndSend("/topic/presence", Map.of(
            "userId", userId,
            "online", online
        ));
    }
}

