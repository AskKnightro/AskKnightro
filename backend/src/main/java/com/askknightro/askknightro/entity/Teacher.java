package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Teacher")
public class Teacher {

    @Id
    @Column(name = "teacher_id")
    private Integer teacherId;

    private String name;

    private String email;

    private String department;

    @Column(name = "profile_picture")
    private String profilePicture;

    // store encrypted/hashed only
    private String password;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    @Builder.Default
    private List<CourseClass> courseClasses = new ArrayList<>();
}