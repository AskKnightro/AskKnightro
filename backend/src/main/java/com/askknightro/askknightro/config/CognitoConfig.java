package com.askknightro.askknightro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

@Configuration
public class CognitoConfig {
    @Bean
    CognitoIdentityProviderClient cognitoIdentityProviderClient(
        @Value("${aws.region}") String region) {
        if (region == null || region.isBlank()) {
        throw new IllegalStateException("Missing property 'aws.region'");
        }
            return CognitoIdentityProviderClient.builder()
        .region(software.amazon.awssdk.regions.Region.of(region))
        .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
        .build();
    }
}
