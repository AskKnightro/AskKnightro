package com.askknightro.askknightro.entity;


import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "class")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Integer classId;

    @Column(name = "enrollment_code")
    private String enrollmentCode;

    @Column(name = "course_name")
    private String courseName;

    private String semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "course_description", columnDefinition = "TEXT")
    private String courseDescription;

    @Column(name = "shard_id")
    private String shardId;
}