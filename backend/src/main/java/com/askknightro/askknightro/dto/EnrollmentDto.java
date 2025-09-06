package com.askknightro.askknightro.dto;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollmentDto implements Serializable {
    private Integer enrollmentId;
    private Integer studentId;
    private Integer classId;
    private LocalDateTime timeCreated;
}
