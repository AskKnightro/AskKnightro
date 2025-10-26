package com.askknightro.askknightro.dto;

import com.askknightro.askknightro.dto.UnifiedSignupRequestDto.Role;

import jakarta.validation.constraints.*;

public record ConfirmSignupRequest(
  @NotBlank String username,    // email
  @NotBlank String code,        // verification code
  @NotNull Role role,           // echo role chosen at /signup
  String name                   // optional: if you didn't persist pending signup
) {}