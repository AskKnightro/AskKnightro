package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Chat_Message")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId;

    @Column(name = "session_id")
    private Integer sessionId;

    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "class_id")
    private Integer classId;

    @Column(name = "sender_type")
    private String senderType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;
}