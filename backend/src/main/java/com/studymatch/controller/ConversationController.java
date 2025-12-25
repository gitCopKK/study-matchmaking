package com.studymatch.controller;

import com.studymatch.dto.ConversationDto;
import com.studymatch.dto.MessageDto;
import com.studymatch.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ConversationDto>> getConversations() {
        return ResponseEntity.ok(chatService.getConversations());
    }

    @PostMapping
    public ResponseEntity<ConversationDto> createConversation(@RequestBody ConversationDto.CreateRequest request) {
        return ResponseEntity.ok(chatService.createOrGetConversation(request.getTargetUserId()));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<Page<MessageDto>> getMessages(
        @PathVariable UUID conversationId,
        @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(chatService.getMessages(conversationId, page));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(
        @PathVariable UUID conversationId,
        @RequestBody MessageDto.SendRequest request
    ) {
        return ResponseEntity.ok(chatService.sendMessage(conversationId, request.getContent()));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID conversationId) {
        chatService.markAsRead(conversationId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{conversationId}/delivered")
    public ResponseEntity<Void> markAsDelivered(@PathVariable UUID conversationId) {
        chatService.markAsDelivered(conversationId);
        return ResponseEntity.ok().build();
    }
}

