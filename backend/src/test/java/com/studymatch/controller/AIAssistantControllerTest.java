package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.service.AIAssistantService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AI Assistant Controller Tests")
class AIAssistantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIAssistantService aiAssistantService;

    @Nested
    @DisplayName("GET /api/ai/status")
    class GetStatusTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return AI status enabled")
        void shouldReturnAIStatusEnabled() throws Exception {
            when(aiAssistantService.isEnabled()).thenReturn(true);

            mockMvc.perform(get("/api/ai/status"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(true));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return AI status disabled")
        void shouldReturnAIStatusDisabled() throws Exception {
            when(aiAssistantService.isEnabled()).thenReturn(false);

            mockMvc.perform(get("/api/ai/status"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(false));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/ai/status"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/ai/toggle")
    class ToggleAITests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should toggle AI on")
        void shouldToggleAIOn() throws Exception {
            Map<String, Boolean> request = new HashMap<>();
            request.put("enabled", true);

            doNothing().when(aiAssistantService).setEnabled(anyBoolean());
            when(aiAssistantService.isEnabled()).thenReturn(true);

            mockMvc.perform(post("/api/ai/toggle")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(true));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should toggle AI off")
        void shouldToggleAIOff() throws Exception {
            Map<String, Boolean> request = new HashMap<>();
            request.put("enabled", false);

            doNothing().when(aiAssistantService).setEnabled(anyBoolean());
            when(aiAssistantService.isEnabled()).thenReturn(false);

            mockMvc.perform(post("/api/ai/toggle")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.enabled").value(false));
        }
    }

    @Nested
    @DisplayName("POST /api/ai/explain")
    class ExplainConceptTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should explain concept successfully")
        void shouldExplainConceptSuccessfully() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("topic", "Quantum Physics");
            request.put("context", Map.of("level", "beginner"));

            String explanation = "Quantum physics is the study of matter and energy at the smallest scales...";
            when(aiAssistantService.explainConcept(anyString(), anyMap())).thenReturn(explanation);

            mockMvc.perform(post("/api/ai/explain")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.explanation").value(explanation));
        }
    }

    @Nested
    @DisplayName("POST /api/ai/quiz")
    class GenerateQuizTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should generate quiz successfully")
        void shouldGenerateQuizSuccessfully() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("topic", "Mathematics");
            request.put("numberOfQuestions", 5);

            List<Map<String, Object>> quiz = Arrays.asList(
                createQuizQuestion("What is 2+2?", "4"),
                createQuizQuestion("What is 3x3?", "9")
            );
            when(aiAssistantService.generateQuiz(anyString(), anyInt())).thenReturn(quiz);

            mockMvc.perform(post("/api/ai/quiz")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should generate quiz with default number of questions")
        void shouldGenerateQuizWithDefaultQuestions() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("topic", "History");

            List<Map<String, Object>> quiz = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                quiz.add(createQuizQuestion("Question " + i, "Answer " + i));
            }
            when(aiAssistantService.generateQuiz(anyString(), eq(5))).thenReturn(quiz);

            mockMvc.perform(post("/api/ai/quiz")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /api/ai/flashcards")
    class GenerateFlashcardsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should generate flashcards successfully")
        void shouldGenerateFlashcardsSuccessfully() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("topic", "Biology");
            request.put("numberOfCards", 10);

            List<Map<String, String>> flashcards = Arrays.asList(
                createFlashcard("What is DNA?", "Deoxyribonucleic acid"),
                createFlashcard("What is a cell?", "Basic unit of life")
            );
            when(aiAssistantService.generateFlashcards(anyString(), anyInt())).thenReturn(flashcards);

            mockMvc.perform(post("/api/ai/flashcards")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("POST /api/ai/study-plan")
    class GenerateStudyPlanTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should generate study plan successfully")
        void shouldGenerateStudyPlanSuccessfully() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("subjects", Arrays.asList("Math", "Physics"));
            request.put("availableHours", 4);
            request.put("durationDays", 7);

            Map<String, Object> studyPlan = new HashMap<>();
            studyPlan.put("days", new ArrayList<>());
            studyPlan.put("totalHours", 28);
            when(aiAssistantService.generateStudyPlan(anyList(), anyInt(), anyInt())).thenReturn(studyPlan);

            mockMvc.perform(post("/api/ai/study-plan")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalHours").value(28));
        }
    }

    @Nested
    @DisplayName("POST /api/ai/resources")
    class GetResourceRecommendationsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should get resource recommendations")
        void shouldGetResourceRecommendations() throws Exception {
            Map<String, String> request = new HashMap<>();
            request.put("topic", "Machine Learning");

            List<Map<String, String>> resources = Arrays.asList(
                createResource("Coursera ML Course", "https://coursera.org/ml"),
                createResource("ML Book", "https://mlbook.com")
            );
            when(aiAssistantService.getResourceRecommendations(anyString())).thenReturn(resources);

            mockMvc.perform(post("/api/ai/resources")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("POST /api/ai/chat")
    class ChatTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should chat with AI successfully")
        void shouldChatWithAISuccessfully() throws Exception {
            Map<String, Object> request = new HashMap<>();
            request.put("message", "Explain calculus");
            request.put("history", Collections.emptyList());

            String response = "Calculus is the mathematical study of continuous change...";
            when(aiAssistantService.chat(anyString(), anyList())).thenReturn(response);

            mockMvc.perform(post("/api/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.response").value(response));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should chat with conversation history")
        void shouldChatWithConversationHistory() throws Exception {
            List<Map<String, String>> history = Arrays.asList(
                Map.of("role", "user", "content", "What is integration?"),
                Map.of("role", "assistant", "content", "Integration is the reverse of differentiation...")
            );

            Map<String, Object> request = new HashMap<>();
            request.put("message", "Give me an example");
            request.put("history", history);

            String response = "Here's an example: ∫x² dx = x³/3 + C";
            when(aiAssistantService.chat(anyString(), anyList())).thenReturn(response);

            mockMvc.perform(post("/api/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.response").exists());
        }
    }

    private Map<String, Object> createQuizQuestion(String question, String answer) {
        Map<String, Object> q = new HashMap<>();
        q.put("question", question);
        q.put("answer", answer);
        q.put("options", Arrays.asList("A", "B", "C", "D"));
        return q;
    }

    private Map<String, String> createFlashcard(String front, String back) {
        Map<String, String> card = new HashMap<>();
        card.put("front", front);
        card.put("back", back);
        return card;
    }

    private Map<String, String> createResource(String title, String url) {
        Map<String, String> resource = new HashMap<>();
        resource.put("title", title);
        resource.put("url", url);
        return resource;
    }
}

