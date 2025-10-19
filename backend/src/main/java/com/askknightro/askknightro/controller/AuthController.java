package com.askknightro.askknightro.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api")
//@RequiredArgsConstructor
public class AuthController {
    
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt, Authentication auth){
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("sub", jwt.getSubject());
        out.put("username", Optional.ofNullable(jwt.getClaimAsString("username")).orElse(jwt.getSubject()));
        out.put("email", jwt.getClaimAsString("email"));
        out.put("groups", jwt.getClaimAsStringList("cognito:groups"));
        out.put("scopes", jwt.getClaimAsString("scope"));
        out.put("authorities", auth.getAuthorities().stream().map(Object::toString).toList());
        out.put("issuedAt", Optional.ofNullable(jwt.getIssuedAt()).map(Instant::toString).orElse(null));
        out.put("expiresAt", Optional.ofNullable(jwt.getExpiresAt()).map(Instant::toString).orElse(null));
        return out;
    }

    // Matches your HttpSecurity rule: .requestMatchers("/api/student/**").hasAnyRole("student","instructor")
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/ping")
    public Map<String, String> studentPing() {
        return Map.of("ok", "student");
    }

    // Belt + suspenders: HttpSecurity also protects /api/instructor/**, but we add method security too.
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @GetMapping("/instructor/ping")
    public Map<String, String> instructorPing() {
        return Map.of("ok", "instructor");
    }
}
