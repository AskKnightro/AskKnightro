package com.askknightro.askknightro.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatSessionDto {
    private Integer sessionId;
    private Integer studentId;
    private Integer classId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
