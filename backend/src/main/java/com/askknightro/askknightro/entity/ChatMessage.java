package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "Chat_Message")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class ChatMessage {

    @Id
    @Column(name = "message_id")
    private Integer messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ChatSession session;

    @Column(name = "sender_type")
    private String senderType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}