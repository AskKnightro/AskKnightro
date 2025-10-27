package com.askknightro.askknightro.controller;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.askknightro.askknightro.dto.ConfirmSignupRequest;
import com.askknightro.askknightro.dto.LoginRequestDto;
import com.askknightro.askknightro.dto.LoginResponseDto;
import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.dto.TeacherDto;
import com.askknightro.askknightro.dto.UnifiedSignupRequestDto;
import com.askknightro.askknightro.dto.UnifiedSignupRequestDto.Role;
import com.askknightro.askknightro.service.CognitoAdminService;
import com.askknightro.askknightro.service.CognitoAuthService;
import com.askknightro.askknightro.service.StudentService;
import com.askknightro.askknightro.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.cognitoidentityprovider.model.InvalidParameterException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.NotAuthorizedException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserNotConfirmedException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final CognitoAuthService cognito;         // wraps SignUp/ConfirmSignUp
    private final CognitoAdminService admin;           // for admin operations like adding to groups
    private final JwtDecoder jwtDecoder;        // your ACCESS token decoder (already used by resource server)
    private final JwtDecoder cognitoIdTokenDecoder; // the ID token decoder bean above

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody UnifiedSignupRequestDto req) {
        System.out.println("SIGNUP ENDPOINT HIT");
        // Self sign-up in Cognito
        cognito.signUp(req.email(), req.password(), req.name());

        if (req.role() == Role.STUDENT) {
            studentService.createDraftFromSignup(
            StudentDto.builder()
                .name(req.name())
                .email(req.email())
                .password(req.password())            // will be hashed in service
                .profilePicture(req.profilePicture())
                .yearStanding(req.yearStanding())
                .major(req.major())
                .gradDate(req.gradDate())
                .schoolId(req.schoolId())
                .universityCollege(req.universityCollege())
                .build()
            );
        } 
        else if (req.role() == Role.TEACHER) {
            teacherService.createDraftFromSignup(
            TeacherDto.builder()
                .name(req.name())
                .email(req.email())
                .password(req.password())            // will be hashed in service
                .department(req.department())
                .profilePicture(req.profilePicture())
                .bio(req.bio())
                .build()
            );
        }
        
        return ResponseEntity.accepted().build(); // user must confirm with code
    }

    @PostMapping("/confirm-signup")
    public ResponseEntity<?> confirm(@Valid @RequestBody ConfirmSignupRequest req) {
        var identity = cognito.confirmSignUp(req.username(), req.code()); // returns sub + username

        // Map your enum to group name
        String group = switch (req.role()) { // req.role() add Role to ConfirmSignupRequest
            case STUDENT -> "student";
            case TEACHER -> "teacher";
        };

        admin.adminAddUserToGroup(identity.username(), group);   // <-- assign role in Cognito
        
        if (req.role() == Role.STUDENT) {
            studentService.attachCognitoIdentityOnConfirm(req.username(), identity.sub(), identity.username());
        } else if (req.role() == Role.TEACHER) {
            teacherService.attachCognitoIdentityOnConfirm(req.username(), identity.sub(), identity.username());
        }
        
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto req) {
        String email = req.username().toLowerCase(Locale.ROOT);

        var out = cognito.login(email, req.password());
        if (out.challengeName() != null) return ResponseEntity.status(409).body(out);

        try {
            Jwt at = jwtDecoder.decode(out.accessToken());        // validate + read groups
            Jwt id = cognitoIdTokenDecoder.decode(out.idToken()); // validate + read name/email

            String sub = at.getClaimAsString("sub");
            String username = Optional.ofNullable(at.getClaimAsString("username"))
                .orElseGet(() -> Optional.ofNullable(at.getClaimAsString("cognito:username")).orElse(sub));

            @SuppressWarnings("unchecked")
            var groups = (List<String>) at.getClaims().getOrDefault("cognito:groups", List.of());

            String name = Optional.ofNullable(id.getClaimAsString("name")).orElse("");

            if (groups.contains("student"))  studentService.ensureStudentFromLogin(sub, username, email, name);
            if (groups.contains("teacher"))  teacherService.ensureTeacherFromLogin(sub, username, email, name);
        } catch (Exception e) {
            // If decode fails, just skip auto-provision. Client still gets tokens.
        }

        return ResponseEntity.ok(out);
    }

}
