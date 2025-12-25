package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.ConversationDto;
import com.studymatch.dto.MessageDto;
import com.studymatch.service.ChatService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Conversation Controller Tests")
class ConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @Nested
    @DisplayName("GET /api/conversations")
    class GetConversationsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return user's conversations")
        void shouldReturnUserConversations() throws Exception {
            List<ConversationDto> conversations = Arrays.asList(
                createMockConversationDto(),
                createMockConversationDto()
            );
            when(chatService.getConversations()).thenReturn(conversations);

            mockMvc.perform(get("/api/conversations"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when no conversations")
        void shouldReturnEmptyListWhenNoConversations() throws Exception {
            when(chatService.getConversations()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/conversations"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/conversations"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/conversations")
    class CreateConversationTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create or get conversation")
        void shouldCreateOrGetConversation() throws Exception {
            UUID targetUserId = UUID.randomUUID();
            Map<String, Object> request = new HashMap<>();
            request.put("targetUserId", targetUserId.toString());

            ConversationDto conversation = createMockConversationDto();
            when(chatService.createOrGetConversation(any(UUID.class))).thenReturn(conversation);

            mockMvc.perform(post("/api/conversations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists());
        }
    }

    @Nested
    @DisplayName("GET /api/conversations/{conversationId}/messages")
    class GetMessagesTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return paginated messages")
        void shouldReturnPaginatedMessages() throws Exception {
            UUID conversationId = UUID.randomUUID();
            List<MessageDto> messages = Arrays.asList(
                createMockMessageDto("Hello"),
                createMockMessageDto("Hi there")
            );
            when(chatService.getMessages(any(UUID.class), anyInt()))
                .thenReturn(new PageImpl<>(messages));

            mockMvc.perform(get("/api/conversations/" + conversationId + "/messages")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return messages for specific page")
        void shouldReturnMessagesForSpecificPage() throws Exception {
            UUID conversationId = UUID.randomUUID();
            when(chatService.getMessages(any(UUID.class), eq(1)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

            mockMvc.perform(get("/api/conversations/" + conversationId + "/messages")
                    .param("page", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/conversations/{conversationId}/messages")
    class SendMessageTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should send message successfully")
        void shouldSendMessageSuccessfully() throws Exception {
            UUID conversationId = UUID.randomUUID();
            Map<String, String> request = new HashMap<>();
            request.put("content", "Hello, how are you?");

            MessageDto sentMessage = createMockMessageDto("Hello, how are you?");
            when(chatService.sendMessage(any(UUID.class), anyString())).thenReturn(sentMessage);

            mockMvc.perform(post("/api/conversations/" + conversationId + "/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").value("Hello, how are you?"));
        }
    }

    @Nested
    @DisplayName("POST /api/conversations/{conversationId}/read")
    class MarkAsReadTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should mark conversation as read")
        void shouldMarkConversationAsRead() throws Exception {
            UUID conversationId = UUID.randomUUID();
            doNothing().when(chatService).markAsRead(any(UUID.class));

            mockMvc.perform(post("/api/conversations/" + conversationId + "/read"))
                    .andExpect(status().isOk());

            verify(chatService).markAsRead(conversationId);
        }
    }

    @Nested
    @DisplayName("POST /api/conversations/{conversationId}/delivered")
    class MarkAsDeliveredTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should mark conversation as delivered")
        void shouldMarkConversationAsDelivered() throws Exception {
            UUID conversationId = UUID.randomUUID();
            doNothing().when(chatService).markAsDelivered(any(UUID.class));

            mockMvc.perform(post("/api/conversations/" + conversationId + "/delivered"))
                    .andExpect(status().isOk());

            verify(chatService).markAsDelivered(conversationId);
        }
    }

    private ConversationDto createMockConversationDto() {
        return ConversationDto.builder()
                .id(UUID.randomUUID())
                .unreadCount(0L)
                .build();
    }

    private MessageDto createMockMessageDto(String content) {
        MessageDto message = new MessageDto();
        message.setId(UUID.randomUUID());
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        return message;
    }
}

