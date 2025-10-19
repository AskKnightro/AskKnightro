// src/main/java/com/askknightro/askknightro/service/CognitoAdminService.java
package com.askknightro.askknightro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

@Service
public class CognitoAdminService {

  private final String awsRegion;
  private final String userPoolId;

  // Constructor injection; no Lombok required
  public CognitoAdminService(
      @Value("${aws.region}") String awsRegion,
      @Value("${cognito.userPoolId}") String userPoolId
  ) {
    this.awsRegion = awsRegion;
    this.userPoolId = userPoolId;
  }

  private CognitoIdentityProviderClient client() {
    return CognitoIdentityProviderClient.builder()
        .region(Region.of(awsRegion))
        .credentialsProvider(DefaultCredentialsProvider.create())
        .build();
  }

  public void createOrUpdateUser(String email, String name, String password, String group) {
    var cognito = client();

    try {
      var create = AdminCreateUserRequest.builder()
          .userPoolId(userPoolId)
          .username(email)
          .userAttributes(
              AttributeType.builder().name("email").value(email).build(),
              AttributeType.builder().name("email_verified").value("true").build(),
              AttributeType.builder().name("name").value(name).build()
          )
          .messageAction(MessageActionType.SUPPRESS)
          .build();
      cognito.adminCreateUser(create);
    } catch (UsernameExistsException e) {
      // user already exists — proceed to set password & group
    }

    var pwd = AdminSetUserPasswordRequest.builder()
        .userPoolId(userPoolId)
        .username(email)
        .password(password)
        .permanent(true)
        .build();
    cognito.adminSetUserPassword(pwd);

    var add = AdminAddUserToGroupRequest.builder()
        .userPoolId(userPoolId)
        .username(email)
        .groupName(group)
        .build();
    cognito.adminAddUserToGroup(add);
  }
}
