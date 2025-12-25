package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.BugReportDto;
import com.studymatch.dto.CreateBugReportRequest;
import com.studymatch.service.BugReportService;
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
@DisplayName("Bug Report Controller Tests")
class BugReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BugReportService bugReportService;

    @Nested
    @DisplayName("POST /api/bug-reports")
    class CreateBugReportTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create bug report successfully")
        void shouldCreateBugReportSuccessfully() throws Exception {
            CreateBugReportRequest request = new CreateBugReportRequest();
            request.setTitle("Button not working");
            request.setDescription("The submit button doesn't respond to clicks");
            request.setCategory("UI_ISSUE");
            request.setBrowserInfo("Chrome 120");
            request.setPageUrl("/profile");

            BugReportDto createdReport = createMockBugReportDto("Button not working", "OPEN");
            when(bugReportService.createBugReport(any(CreateBugReportRequest.class))).thenReturn(createdReport);

            mockMvc.perform(post("/api/bug-reports")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Button not working"))
                    .andExpect(jsonPath("$.status").value("OPEN"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create bug report with all categories")
        void shouldCreateBugReportWithDifferentCategories() throws Exception {
            String[] categories = {"UI_ISSUE", "PERFORMANCE", "CRASH", "LOGIN_ISSUE", "MATCHING", "CHAT", "SESSIONS", "FEATURE_REQUEST", "OTHER"};
            
            for (String category : categories) {
                CreateBugReportRequest request = new CreateBugReportRequest();
                request.setTitle("Test bug " + category);
                request.setDescription("Description for " + category);
                request.setCategory(category);

                BugReportDto createdReport = createMockBugReportDto("Test bug " + category, "OPEN");
                when(bugReportService.createBugReport(any(CreateBugReportRequest.class))).thenReturn(createdReport);

                mockMvc.perform(post("/api/bug-reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().isOk());
            }
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            CreateBugReportRequest request = new CreateBugReportRequest();
            request.setTitle("Test bug");
            request.setDescription("Test description");
            request.setCategory("OTHER");

            mockMvc.perform(post("/api/bug-reports")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/bug-reports/my-reports")
    class GetMyBugReportsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return user's bug reports")
        void shouldReturnUsersBugReports() throws Exception {
            List<BugReportDto> reports = Arrays.asList(
                createMockBugReportDto("Bug 1", "OPEN"),
                createMockBugReportDto("Bug 2", "RESOLVED")
            );
            when(bugReportService.getMyBugReports(anyInt()))
                .thenReturn(new PageImpl<>(reports));

            mockMvc.perform(get("/api/bug-reports/my-reports")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(2));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty page when no reports")
        void shouldReturnEmptyPageWhenNoReports() throws Exception {
            when(bugReportService.getMyBugReports(anyInt()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

            mockMvc.perform(get("/api/bug-reports/my-reports")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/bug-reports (Admin)")
    class GetAllBugReportsTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return all bug reports for admin")
        void shouldReturnAllBugReportsForAdmin() throws Exception {
            List<BugReportDto> reports = Arrays.asList(
                createMockBugReportDto("Bug 1", "OPEN"),
                createMockBugReportDto("Bug 2", "IN_PROGRESS"),
                createMockBugReportDto("Bug 3", "RESOLVED")
            );
            when(bugReportService.getAllBugReports(anyInt(), isNull()))
                .thenReturn(new PageImpl<>(reports));

            mockMvc.perform(get("/api/bug-reports")
                    .param("page", "0"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(3));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should filter bug reports by status")
        void shouldFilterBugReportsByStatus() throws Exception {
            List<BugReportDto> openReports = Arrays.asList(
                createMockBugReportDto("Open Bug 1", "OPEN"),
                createMockBugReportDto("Open Bug 2", "OPEN")
            );
            when(bugReportService.getAllBugReports(anyInt(), eq("OPEN")))
                .thenReturn(new PageImpl<>(openReports));

            mockMvc.perform(get("/api/bug-reports")
                    .param("page", "0")
                    .param("status", "OPEN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content.length()").value(2));
        }

        @Test
        @WithMockUser(username = "user@example.com", roles = {"USER"})
        @DisplayName("Should return 403 for non-admin user")
        void shouldReturn403ForNonAdmin() throws Exception {
            mockMvc.perform(get("/api/bug-reports"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/bug-reports/stats (Admin)")
    class GetBugReportStatsTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should return bug report stats for admin")
        void shouldReturnBugReportStatsForAdmin() throws Exception {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalReports", 50);
            stats.put("openReports", 20);
            stats.put("inProgressReports", 15);
            stats.put("resolvedReports", 15);
            when(bugReportService.getBugReportStats()).thenReturn(stats);

            mockMvc.perform(get("/api/bug-reports/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalReports").value(50))
                    .andExpect(jsonPath("$.openReports").value(20));
        }

        @Test
        @WithMockUser(username = "user@example.com", roles = {"USER"})
        @DisplayName("Should return 403 for non-admin user")
        void shouldReturn403ForNonAdmin() throws Exception {
            mockMvc.perform(get("/api/bug-reports/stats"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /api/bug-reports/{id} (Admin)")
    class UpdateBugReportTests {

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should update bug report status")
        void shouldUpdateBugReportStatus() throws Exception {
            UUID reportId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("status", "IN_PROGRESS");

            BugReportDto updatedReport = createMockBugReportDto("Test Bug", "IN_PROGRESS");
            when(bugReportService.updateBugReport(any(UUID.class), anyString(), isNull(), isNull()))
                .thenReturn(updatedReport);

            mockMvc.perform(put("/api/bug-reports/" + reportId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should update bug report priority")
        void shouldUpdateBugReportPriority() throws Exception {
            UUID reportId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("priority", "HIGH");

            BugReportDto updatedReport = createMockBugReportDto("Test Bug", "OPEN");
            updatedReport.setPriority("HIGH");
            when(bugReportService.updateBugReport(any(UUID.class), isNull(), eq("HIGH"), isNull()))
                .thenReturn(updatedReport);

            mockMvc.perform(put("/api/bug-reports/" + reportId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should add admin notes to bug report")
        void shouldAddAdminNotesToBugReport() throws Exception {
            UUID reportId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("adminNotes", "Working on this issue");

            BugReportDto updatedReport = createMockBugReportDto("Test Bug", "IN_PROGRESS");
            updatedReport.setAdminNotes("Working on this issue");
            when(bugReportService.updateBugReport(any(UUID.class), isNull(), isNull(), eq("Working on this issue")))
                .thenReturn(updatedReport);

            mockMvc.perform(put("/api/bug-reports/" + reportId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
        @DisplayName("Should update multiple fields at once")
        void shouldUpdateMultipleFieldsAtOnce() throws Exception {
            UUID reportId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("status", "RESOLVED");
            body.put("priority", "LOW");
            body.put("adminNotes", "Fixed in version 1.2.3");

            BugReportDto updatedReport = createMockBugReportDto("Test Bug", "RESOLVED");
            updatedReport.setPriority("LOW");
            updatedReport.setAdminNotes("Fixed in version 1.2.3");
            when(bugReportService.updateBugReport(any(UUID.class), eq("RESOLVED"), eq("LOW"), eq("Fixed in version 1.2.3")))
                .thenReturn(updatedReport);

            mockMvc.perform(put("/api/bug-reports/" + reportId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(username = "user@example.com", roles = {"USER"})
        @DisplayName("Should return 403 for non-admin user")
        void shouldReturn403ForNonAdmin() throws Exception {
            UUID reportId = UUID.randomUUID();
            Map<String, String> body = new HashMap<>();
            body.put("status", "RESOLVED");

            mockMvc.perform(put("/api/bug-reports/" + reportId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
                    .andExpect(status().isForbidden());
        }
    }

    private BugReportDto createMockBugReportDto(String title, String status) {
        BugReportDto dto = new BugReportDto();
        dto.setId(UUID.randomUUID());
        dto.setTitle(title);
        dto.setDescription("Test description for " + title);
        dto.setStatus(status);
        dto.setCategory("OTHER");
        dto.setCreatedAt(LocalDateTime.now());
        return dto;
    }
}

