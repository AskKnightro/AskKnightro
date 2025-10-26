package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "Course_Material")
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class CourseMaterial {

    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Course courseClass;

    private String name;

    @Column(name = "vector_id", unique = true)
    private String vectorId;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}