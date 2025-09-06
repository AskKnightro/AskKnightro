package com.askknightro.askknightro.dto;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OutboxDto implements Serializable {
    private Integer id;
    private String aggregate;
    private Integer aggregateId;
    private String eventType;
    private String payload;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
}