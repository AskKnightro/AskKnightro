package com.askknightro.askknightro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


import java.time.LocalDateTime;

// Course Material Entity that maps to Postgres DB
@Entity
@Table(name = "course_material")
@Data
public class CourseMaterial
{

    @Id
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "vector_id")
    private String vectorId;

    @Column(name = "class_id")
    private Integer classIid;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

}
