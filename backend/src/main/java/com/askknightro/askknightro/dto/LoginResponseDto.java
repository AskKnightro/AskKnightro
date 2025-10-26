package com.askknightro.askknightro.dto;

public record LoginResponseDto(
  String idToken,
  String accessToken,
  String refreshToken,
  String challengeName,   // usually null for self-signup
  String session          // only if a challenge is returned
) {}
