package com.askknightro.askknightro.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties.Jwt;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
//import org.springframework.security.oauth2.core.OAuth2TokenValidator;
//import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.CollectionUtils;
import org.springframework.security.oauth2.jwt.Jwt;

@Configuration
@EnableWebSecurity
//@EnableMethodSecurity // Enables @PreAuthorize, hasRole, etc.
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, JwtDecoder jwtDecoder) throws Exception {
        http
        .csrf(csrf -> csrf.disable()) 
        // Defining path rules
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.GET, "/health").permitAll()
            .requestMatchers("/api/actuator/health").permitAll()
            .requestMatchers("/api/instructor/**").hasRole("INSTRUCTOR")
            .requestMatchers("/api/student/**").hasAnyRole("STUDENT")
            .anyRequest().authenticated()
        )
        // Turns the app into an OAuth2 Resource Server
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.decoder(jwtDecoder).jwtAuthenticationConverter(cognitoJwtAuthConverter())) // critical for roles
        );
        return http.build();
    }

    // Verifies signature & timestamps (and issuer/audience if configured). If invalid -> 401
    /*@Bean
    JwtDecoder jwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer, @Value("${cognito.appClientId}") String audience) {
        return JwtDecoders.fromIssuerLocation(issuer);
    }*/

    @Bean
    JwtDecoder jwtDecoder(@Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer, 
    @Value("${cognito.appClientId}") String appClientId) {
        NimbusJwtDecoder decoder = (NimbusJwtDecoder) JwtDecoders.fromIssuerLocation(issuer);
        var defaultWithIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        OAuth2TokenValidator<Jwt> cognitoAccessTokenValidator = jwt -> {
            // 1) Must be an access token
            String tokenUse = jwt.getClaimAsString("token_use");
            if (!"access".equals(tokenUse)) {
                return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "token_use must be 'access'", null)
                );
            }

            // 2) Must be for our app client
            String clientId = jwt.getClaimAsString("client_id");
            if (!appClientId.equals(clientId)) {
                return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "client_id mismatch", null)
                );
            }

            // 3) (Optional) Require certain scopes
            String scope = jwt.getClaimAsString("scope"); // e.g. "openid email phone"
            // if you need a specific scope: require scope != null && scope.contains("your/scope")

            return OAuth2TokenValidatorResult.success();
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(defaultWithIssuer, cognitoAccessTokenValidator));
        return decoder;
}

    Converter<Jwt, ? extends AbstractAuthenticationToken> cognitoJwtAuthConverter() {
        JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
        scopes.setAuthoritiesClaimName("scope");
        scopes.setAuthorityPrefix("SCOPE_");

        return jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>(scopes.convert(jwt));

            Object groupsClaim = jwt.getClaims().get("cognito:groups");
            if (groupsClaim instanceof Collection<?> groups && !CollectionUtils.isEmpty(groups)) {
                authorities.addAll(groups.stream()
                    .map(Object::toString)
                    .map(String::toUpperCase)
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .collect(Collectors.toSet()));
            }

            // Prefer Cognito username if present, otherwise subject
            String name = Optional.ofNullable(jwt.getClaimAsString("username"))
                    .orElseGet(jwt::getSubject);

            return new JwtAuthenticationToken(jwt, authorities, name);
        };
    }

    // Simple audience (aud) validator
    static class AudienceValidator implements OAuth2TokenValidator<Jwt> {
        private final String audience;
        AudienceValidator(String audience) { this.audience = audience; }

        @Override
        public OAuth2TokenValidatorResult validate(Jwt jwt) {
            List<String> aud = jwt.getAudience();
            if (aud != null && aud.contains(audience)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "Required audience is missing", null));
        }
    }
}
