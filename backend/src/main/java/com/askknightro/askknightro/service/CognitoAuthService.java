package com.askknightro.askknightro.service;

import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminGetUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminGetUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ConfirmSignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest;

@Service
@RequiredArgsConstructor
public class CognitoAuthService {
    // Injected from @Bean below or constructor
  private final CognitoIdentityProviderClient idp;

  @Value("${cognito.region}")         private String region;
  @Value("${cognito.userPoolId}")     private String userPoolId;
  @Value("${cognito.appClientId}")    private String clientId;
  @Value("${cognito.appClientSecret:}") private String clientSecret; // optional

  /** Simple tuple for (sub, username) */
  public record Identity(String sub, String username) {}

  // -------------------
  // Public API
  // -------------------

  /** Self sign-up with email as username (recommended). */
  public void signUp(String email, String password, String name) {
    SignUpRequest.Builder b = SignUpRequest.builder()
        .clientId(clientId)
        .username(email)
        .password(password)
        .userAttributes(
            AttributeType.builder().name("email").value(email).build(),
            AttributeType.builder().name("name").value(name).build()
        );

    String sh = secretHash(email);
    if (sh != null) b.secretHash(sh);

    idp.signUp(b.build());
    // If pool requires confirmation, user must call confirmSignUp with the code.
  }

  /**
   * Confirm a user's sign-up with the verification code they received.
   * Returns the Cognito sub + username so you can persist them in your DB.
   */
  public Identity confirmSignUp(String username, String code) {
    ConfirmSignUpRequest.Builder b = ConfirmSignUpRequest.builder()
        .clientId(clientId)
        .username(username)
        .confirmationCode(code);

    String sh = secretHash(username);
    if (sh != null) b.secretHash(sh);

    idp.confirmSignUp(b.build());

    // After confirmation, fetch attributes to get the sub
    AdminGetUserResponse user = idp.adminGetUser(AdminGetUserRequest.builder()
        .userPoolId(userPoolId)
        .username(username)
        .build());

    String sub = user.userAttributes().stream()
        .filter(a -> "sub".equals(a.name()))
        .findFirst()
        .map(AttributeType::value)
        .orElseThrow(() -> new RuntimeException("Cognito user missing 'sub'"));

    return new Identity(sub, user.username());
  }

  private String secretHash(String username) {
    if (clientSecret == null || clientSecret.isBlank()) return null;
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(clientSecret.getBytes(), "HmacSHA256"));
      byte[] raw = mac.doFinal((username + clientId).getBytes());
      return Base64.getEncoder().encodeToString(raw);
    } catch (Exception e) {
      throw new RuntimeException("Failed to compute SECRET_HASH", e);
    }
  }
}
