package com.askknightro.askknightro.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data // Generates getter and setter methods under the hood
@AllArgsConstructor
@NoArgsConstructor
public class CourseMaterialDTO
{
    private Integer id;
    private String name;
    private String vectorId;
    private Integer classId;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}
