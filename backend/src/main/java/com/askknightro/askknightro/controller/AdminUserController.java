// src/main/java/com/askknightro/askknightro/controller/AdminUserController.java
package com.askknightro.askknightro.controller;

import java.util.Map;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.askknightro.askknightro.service.CognitoAdminService;

@RestController
@RequestMapping("/api/admin/users")
@Validated
public class AdminUserController {

  private final CognitoAdminService svc;
  public AdminUserController(CognitoAdminService svc){ this.svc = svc; }

  public record CreateUserReq(
      @NotBlank String name,
      @Email String email,
      @NotBlank String password,
      @NotBlank String role // "student" or "instructor"
  ){}

  // Lock this to admins in your app (adjust to your converter/authorities setup)
  @PostMapping
  @PreAuthorize("hasAuthority('ROLE_admin') or hasAuthority('GROUP_admin')")
  public Map<String,String> create(@RequestBody CreateUserReq req){
    var role = req.role().toLowerCase();
    if (!role.equals("student") && !role.equals("instructor")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role (use 'student' or 'instructor')");
    }
    try {
      svc.createOrUpdateUser(req.email(), req.name(), req.password(), role);
      return Map.of("status","ok","email",req.email(),"role",role);
    } catch (Exception e){
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cognito error: " + e.getMessage(), e);
    }
  }
}
