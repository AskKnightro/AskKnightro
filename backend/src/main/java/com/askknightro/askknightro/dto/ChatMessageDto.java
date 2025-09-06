package com.askknightro.askknightro.dto;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageDto implements Serializable {
    private Integer messageId;
    private Integer sessionId;
    private String senderType;
    private String content;
    private LocalDateTime timestamp;
}
