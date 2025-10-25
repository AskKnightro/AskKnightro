// IdentityProvisioningService.java
package com.askknightro.askknightro.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdentityProvisioningService {
  private final CognitoAdminService cognito;

  public record ProvisionedIdentity(String sub, String username) {}

  public ProvisionedIdentity createStudentIdentity(String email, String name) {
    var u = cognito.adminCreateOrGetUser(email, name, /*suppressInvite*/ true);
    // Optional: set permanent password ONLY for admin-driven flows:
    // cognito.adminSetPermanentPassword(u.username(), tempOrProvidedPassword);
    cognito.adminAddUserToGroup(u.username(), "student");
    return new ProvisionedIdentity(u.sub(), u.username());
  }

  public ProvisionedIdentity createTeacherIdentity(String email, String name) {
    var u = cognito.adminCreateOrGetUser(email, name, true);
    cognito.adminAddUserToGroup(u.username(), "teacher");
    return new ProvisionedIdentity(u.sub(), u.username());
  }

  public void updateEmail(String username, String newEmail) {
    cognito.adminUpdateUserEmail(username, newEmail, true);
  }

  public void disableOrDelete(String username) {
    cognito.adminDisableUser(username); // or delete
  }
}
