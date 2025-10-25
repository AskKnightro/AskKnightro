package com.askknightro.askknightro.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherDto {
    private Integer teacherId;
    private String name;
    private String email;
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String department;
    private String profilePicture;
    private String bio;
    private String cognitoSub;
    private String cognitoUsername;
}