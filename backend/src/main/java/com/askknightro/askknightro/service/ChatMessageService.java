package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.ChatMessageDto;
import com.askknightro.askknightro.entity.ChatMessage;
import com.askknightro.askknightro.entity.ChatSession;
import com.askknightro.askknightro.repository.ChatMessageRepository;
import com.askknightro.askknightro.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;

    public ChatMessageDto saveMessage(ChatMessageDto messageDto) {
        // Ensure ChatSession with ID 1 exists
        if (!chatSessionRepository.existsById(1)) {
            ChatSession defaultSession = ChatSession.builder()
                    .startTime(LocalDateTime.now())
                    .build();
            chatSessionRepository.save(defaultSession);
        }

        // Create new chat message
        ChatMessage chatMessage = ChatMessage.builder()
                .sessionId(1)
                .studentId(messageDto.getStudentId())
                .classId(messageDto.getClassId())
                .senderType(messageDto.getSenderType())
                .content(messageDto.getContent())
                .timestamp(LocalDateTime.now())
                .build();

        // Save to database
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // Convert back to DTO
        return ChatMessageDto.builder()
                .messageId(savedMessage.getMessageId())
                .sessionId(savedMessage.getSessionId())
                .studentId(savedMessage.getStudentId())
                .classId(savedMessage.getClassId())
                .senderType(savedMessage.getSenderType())
                .content(savedMessage.getContent())
                .timestamp(savedMessage.getTimestamp())
                .build();
    }

    public List<ChatMessageDto> getMessagesBySessionId(Integer sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);

        return messages.stream()
                .map(message -> ChatMessageDto.builder()
                        .messageId(message.getMessageId())
                        .sessionId(message.getSessionId())
                        .studentId(message.getStudentId())
                        .classId(message.getClassId())
                        .senderType(message.getSenderType())
                        .content(message.getContent())
                        .timestamp(message.getTimestamp())
                        .build())
                .collect(Collectors.toList());
    }
}