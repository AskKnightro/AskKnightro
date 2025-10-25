package com.askknightro.askknightro.dto;

import jakarta.validation.constraints.*;

public record UnifiedSignupRequestDto(
  @NotBlank String name,
  @NotBlank @Email String email,
  @NotBlank @Size(min = 8) String password,
  @NotNull Role role,

  // Optional profile fields (filled later via /users/me/profile)
  String profilePicture,
  // Student-only (optional at signup)
  String yearStanding, String major, java.time.LocalDate gradDate,
  String schoolId, String universityCollege,
  // Teacher-only (optional at signup)
  String department, String bio
) {
  public enum Role { STUDENT, TEACHER }
}
