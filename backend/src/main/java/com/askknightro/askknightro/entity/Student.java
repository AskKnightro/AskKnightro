package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "Student")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    private String name;

    private String email;

    private String password;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "year_standing")
    private String yearStanding;

    private String major;

    @Column(name = "grad_date")
    private LocalDate gradDate;

    @Column(name = "school_id")
    private String schoolId;

    @Column(name = "university_college")
    private String universityCollege;

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ChatSession> chatSessions = new ArrayList<>();

    @Column(name = "cognito_sub")
    private String cognitoSub;

    @Column(name = "cognito_username")
    private String cognitoUsername;

}