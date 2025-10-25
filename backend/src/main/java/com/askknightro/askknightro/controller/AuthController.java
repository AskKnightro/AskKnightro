package com.askknightro.askknightro.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.askknightro.askknightro.dto.ConfirmSignupRequest;
import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.dto.TeacherDto;
import com.askknightro.askknightro.dto.UnifiedSignupRequestDto;
import com.askknightro.askknightro.service.CognitoAuthService;
import com.askknightro.askknightro.service.IdentityProvisioningService;
import com.askknightro.askknightro.service.StudentService;
import com.askknightro.askknightro.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final CognitoAuthService cognito;         // wraps SignUp/ConfirmSignUp
    private final IdentityProvisioningService idp;    // optional; for admin ops later

    // @PostMapping("/signup/student")
    // @PreAuthorize("permitAll()") // keep StudentController locked; this one stays public
    // public ResponseEntity<StudentDto> signupStudent(@Valid @RequestBody StudentDto dto) {
    //     // Ensure we don't accidentally overwrite an existing record
    //     dto.setStudentId(null);

    //     StudentDto created = studentService.createStudent(dto);

    //     // Location: /api/users/students/{id}
    //     URI location = URI.create("/api/users/students/" + created.getStudentId());
    //     return ResponseEntity.created(location).body(created);
    // }

    // @PostMapping("/signup/teacher")
    // @PreAuthorize("permitAll()") // keep StudentController locked; this one stays public
    // public ResponseEntity<TeacherDto> signupTeacher(@Valid @RequestBody TeacherDto dto) {
    //     // Ensure we don't accidentally overwrite an existing record
    //     dto.setTeacherId(null);

    //     TeacherDto created = teacherService.createTeacher(dto);

    //     // Location: /api/users/students/{id}
    //     URI location = URI.create("/api/users/teacher/" + created.getTeacherId());
    //     return ResponseEntity.created(location).body(created);
    // }

    // @PostMapping("/login")
    // public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto req) {
    //     var out = cognito.login(req);
    //     // If challenge, return 409 so frontend can show "set new password" screen.
    //     return out.challengeName() != null
    //         ? ResponseEntity.status(409).body(out)
    //         : ResponseEntity.ok(out);
    // }
    @PostMapping("/signup")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> signup(@Valid @RequestBody UnifiedSignupRequestDto req) {
        // Self sign-up in Cognito
        cognito.signUp(req.email(), req.password(), req.name());
        // Store a minimal pending record in your own store if you like (optional)
        return ResponseEntity.accepted().build(); // user must confirm with code
    }

    @PostMapping("/confirm-signup")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> confirm(@Valid @RequestBody ConfirmSignupRequest req) {
        var identity = cognito.confirmSignUp(req.username(), req.code()); // returns sub + username

    // You need the role that user chose at /signup.
    // Options:
    // 1) Pass role again here from the client (simplest), OR
    // 2) Persist pending signups keyed by email, including role, then read it here.

    // Assuming client passes it again (simple):
    var role = req.role(); // add Role to ConfirmSignupRequest

    switch (role) {
      case STUDENT -> {
        var created = studentService.createStudent(
            StudentDto.builder()
              .name(req.name())               // include name again OR fetch via AdminGetUser
              .email(req.username())
              .password(null)
              .cognitoSub(identity.sub())
              .cognitoUsername(identity.username())
              .build()
        );
        var loc = URI.create("/api/users/students/" + created.getStudentId());
        return ResponseEntity.created(loc).body(created);
      }
      case TEACHER -> {
        var created = teacherService.createTeacher(
            TeacherDto.builder()
              .name(req.name())
              .email(req.username())
              .password(null)
              .cognitoSub(identity.sub())
              .cognitoUsername(identity.username())
              .build()
        );
        var loc = URI.create("/api/users/teacher/" + created.getTeacherId());
        return ResponseEntity.created(loc).body(created);
      }
    }
    // unreachable
    return ResponseEntity.badRequest().build();}
}
