package com.studymatch.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymatch.dto.GroupDto;
import com.studymatch.service.GroupService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Group Controller Tests")
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupService groupService;

    @Nested
    @DisplayName("GET /api/groups")
    class GetMyGroupsTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return user's groups")
        void shouldReturnUserGroups() throws Exception {
            List<GroupDto> groups = Arrays.asList(
                createMockGroupDto("Study Group 1"),
                createMockGroupDto("Study Group 2")
            );
            when(groupService.getMyGroups()).thenReturn(groups);

            mockMvc.perform(get("/api/groups"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0].name").value("Study Group 1"));
        }

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return empty list when user has no groups")
        void shouldReturnEmptyListWhenNoGroups() throws Exception {
            when(groupService.getMyGroups()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/groups"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/groups"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/groups/{groupId}")
    class GetGroupTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should return group by ID")
        void shouldReturnGroupById() throws Exception {
            UUID groupId = UUID.randomUUID();
            GroupDto group = createMockGroupDto("Test Group");
            when(groupService.getGroup(groupId)).thenReturn(group);

            mockMvc.perform(get("/api/groups/" + groupId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Test Group"));
        }
    }

    @Nested
    @DisplayName("POST /api/groups")
    class CreateGroupTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should create group successfully")
        void shouldCreateGroupSuccessfully() throws Exception {
            GroupDto.CreateRequest request = new GroupDto.CreateRequest();
            request.setName("New Study Group");
            request.setMaxMembers(10);

            GroupDto createdGroup = createMockGroupDto("New Study Group");
            when(groupService.createGroup(any(GroupDto.CreateRequest.class))).thenReturn(createdGroup);

            mockMvc.perform(post("/api/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("New Study Group"));
        }
    }

    @Nested
    @DisplayName("POST /api/groups/{groupId}/members/{userId}")
    class AddMemberTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should add member to group")
        void shouldAddMemberToGroup() throws Exception {
            UUID groupId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            
            GroupDto updatedGroup = createMockGroupDto("Test Group");
            when(groupService.addMember(groupId, userId)).thenReturn(updatedGroup);

            mockMvc.perform(post("/api/groups/" + groupId + "/members/" + userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Test Group"));
        }
    }

    @Nested
    @DisplayName("DELETE /api/groups/{groupId}/members/{userId}")
    class RemoveMemberTests {

        @Test
        @WithMockUser(username = "test@example.com")
        @DisplayName("Should remove member from group")
        void shouldRemoveMemberFromGroup() throws Exception {
            UUID groupId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            
            doNothing().when(groupService).removeMember(groupId, userId);

            mockMvc.perform(delete("/api/groups/" + groupId + "/members/" + userId))
                    .andExpect(status().isOk());
        }
    }

    private GroupDto createMockGroupDto(String name) {
        return GroupDto.builder()
                .id(UUID.randomUUID())
                .name(name)
                .maxMembers(10)
                .build();
    }
}

