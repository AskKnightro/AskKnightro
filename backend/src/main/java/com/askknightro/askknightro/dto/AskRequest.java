package com.askknightro.askknightro.dto;

import lombok.Data;

@Data
public class AskRequest {
    private Integer classId;
    private Integer studentId; // optional; useful for audit later
    private String question;
    private Integer topK; // optional; defaults in service
}