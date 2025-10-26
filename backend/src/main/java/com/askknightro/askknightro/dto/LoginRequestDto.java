package com.askknightro.askknightro.dto;

import jakarta.validation.constraints.*;

public record LoginRequestDto(
  @NotBlank String username,   // email
  @NotBlank String password
) {}