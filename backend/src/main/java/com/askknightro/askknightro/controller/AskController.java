package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.AskRequest;
import com.askknightro.askknightro.dto.AskResponse;
import com.askknightro.askknightro.service.AskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/ask")
@RestController
@RequiredArgsConstructor
public class AskController {

    private final AskService askService;

    @PostMapping
    public ResponseEntity<AskResponse> ask(@RequestBody AskRequest req) {
        return ResponseEntity.ok(askService.answer(req));
    }
}