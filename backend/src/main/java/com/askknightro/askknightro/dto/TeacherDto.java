package com.askknightro.askknightro.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherDto {
    private Integer teacherId;
    private String name;
    private String email;
    private String department;
    private String profilePicture;
    private String bio;
    // If you truly need it for create: private String password; // write-only, never return
}