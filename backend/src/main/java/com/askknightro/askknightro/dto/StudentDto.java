package com.askknightro.askknightro.dto;


import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentDto{
    private Integer studentId;
    private String name;
    private String email;
    private String profilePicture;
    private String yearStanding;
    private String major;
    private LocalDate gradDate;
    private String schoolId;
    private String universityCollege;
}
