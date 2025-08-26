package com.askknightro.askknightro.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api")
@RestController
public class InitController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from Spring Boot!";
    }
}