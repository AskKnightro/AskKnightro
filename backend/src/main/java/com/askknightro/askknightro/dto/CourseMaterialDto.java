package com.askknightro.askknightro.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseMaterialDto {
    private Integer id;
    private Integer classId;
    private String name;
    private String vectorId;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}