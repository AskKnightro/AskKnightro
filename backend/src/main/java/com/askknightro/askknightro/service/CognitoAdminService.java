package com.askknightro.askknightro.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.Optional;

@Service
public class CognitoAdminService {

    private final String awsRegion;
    private final String userPoolId;
    private final CognitoIdentityProviderClient client;

    public record CognitoUser(String sub, String username) {}

    public CognitoAdminService(
            @Value("${aws.region}") String awsRegion,
            @Value("${cognito.userPoolId}") String userPoolId
    ) {
        
        if (awsRegion == null || awsRegion.isBlank()) {
            throw new IllegalStateException("Missing required property 'aws.region'");
        }
        if (userPoolId == null || userPoolId.isBlank()) {
            throw new IllegalStateException("Missing required property 'cognito.userPoolId'");
        }

        this.awsRegion = awsRegion;
        this.userPoolId = userPoolId;
        this.client = CognitoIdentityProviderClient.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    /** Idempotent: creates user if missing, otherwise returns existing. */
    public CognitoUser adminCreateOrGetUser(String email, String name, boolean suppressInvite) {
        try {
            AdminCreateUserRequest.Builder b = AdminCreateUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(email)
                    .userAttributes(
                            AttributeType.builder().name("email").value(email).build(),
                            AttributeType.builder().name("email_verified").value("true").build(),
                            AttributeType.builder().name("name").value(name).build()
                    );
            if (suppressInvite) {
                b.messageAction(MessageActionType.SUPPRESS);
            }
            client.adminCreateUser(b.build());
        } catch (UsernameExistsException ignored) {
            // already exists, fall through to fetch
        }

        // Return identifiers
        return getUserByUsername(email).orElseGet(() ->
                // Some pools use non-email usernames; try search by email as a fallback
                findByEmail(email).orElseThrow(() ->
                        new RuntimeException("Cognito user not found after create/get for email: " + email)));
    }

    /** Sets a PERMANENT password. Use only for trusted admin flows. */
    public void adminSetPermanentPassword(String username, String password) {
        client.adminSetUserPassword(AdminSetUserPasswordRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .password(password)
                .permanent(true)
                .build());
    }

    /** Adds user to a group (idempotent). */
    public void adminAddUserToGroup(String username, String group) {
        client.adminAddUserToGroup(AdminAddUserToGroupRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .groupName(group)
                .build());
    }

    public void adminRemoveUserFromGroup(String username, String group) {
        client.adminRemoveUserFromGroup(AdminRemoveUserFromGroupRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .groupName(group)
                .build());
    }

    public void adminUpdateUserEmail(String username, String newEmail, boolean markVerified) {
        var emailAttr = AttributeType.builder().name("email").value(newEmail).build();
        if (markVerified) {
            var verified = AttributeType.builder().name("email_verified").value("true").build();
            client.adminUpdateUserAttributes(AdminUpdateUserAttributesRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .userAttributes(emailAttr, verified)     // one call
                .build());
        } else {
            client.adminUpdateUserAttributes(AdminUpdateUserAttributesRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .userAttributes(emailAttr)
                .build());
        }
    }

    public void adminDisableUser(String username) {
        client.adminDisableUser(AdminDisableUserRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .build());
    }

    public void adminEnableUser(String username) {
        client.adminEnableUser(AdminEnableUserRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .build());
    }

    public void adminDeleteUser(String username) {
        client.adminDeleteUser(AdminDeleteUserRequest.builder()
                .userPoolId(userPoolId)
                .username(username)
                .build());
    }

    /** === Helpers === */

    public Optional<CognitoUser> getUserByUsername(String username) {
        try {
            AdminGetUserResponse r = client.adminGetUser(AdminGetUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(username)
                    .build());
            String sub = r.userAttributes().stream()
                    .filter(a -> "sub".equals(a.name()))
                    .map(AttributeType::value)
                    .findFirst()
                    .orElse(null);
            return Optional.of(new CognitoUser(sub, r.username()));
        } catch (UserNotFoundException e) {
            return Optional.empty();
        }
    }

    /** Uses ListUsers with a filter on email. */
    public Optional<CognitoUser> findByEmail(String email) {
        ListUsersResponse resp = client.listUsers(ListUsersRequest.builder()
                .userPoolId(userPoolId)
                .filter(String.format("email = \"%s\"", email))
                .limit(1)
                .build());
        if (resp.users().isEmpty()) return Optional.empty();
        UserType u = resp.users().get(0);
        String sub = u.attributes().stream()
                .filter(a -> "sub".equals(a.name()))
                .map(AttributeType::value)
                .findFirst()
                .orElse(null);
        return Optional.of(new CognitoUser(sub, u.username()));
    }
}
