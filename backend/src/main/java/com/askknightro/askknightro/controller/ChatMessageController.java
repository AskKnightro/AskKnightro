package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.ChatMessageDto;
import com.askknightro.askknightro.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @PostMapping()
    public ResponseEntity<?> createMessage(@RequestBody ChatMessageDto messageDto) {
        try {
            ChatMessageDto savedMessage = chatMessageService.saveMessage(messageDto);
            return ResponseEntity.ok().body(savedMessage);
        } catch (Exception e) {
            e.printStackTrace(); // This will show the error in console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ChatMessageDto>> getMessagesBySession(@PathVariable Integer sessionId) {
        try {
            List<ChatMessageDto> messages = chatMessageService.getMessagesBySessionId(sessionId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/student/{studentId}/class/{classId}")
    public ResponseEntity<List<ChatMessageDto>> getMessagesByStudentAndClass(
            @PathVariable Integer studentId,
            @PathVariable Integer classId) {
        try {
            List<ChatMessageDto> messages = chatMessageService.getMessagesByStudentAndClass(studentId, classId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}