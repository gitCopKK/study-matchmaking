package com.studymatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBugReportRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be less than 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must be less than 5000 characters")
    private String description;

    private String category = "OTHER";
    private String browserInfo;
    private String pageUrl;
}

