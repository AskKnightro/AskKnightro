package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "Enrollment")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Enrollment {

    @Id
    @Column(name = "enrollment_id")
    private Integer enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private CourseClass courseClass;

    @Column(name = "time_created")
    private LocalDateTime timeCreated;
}
