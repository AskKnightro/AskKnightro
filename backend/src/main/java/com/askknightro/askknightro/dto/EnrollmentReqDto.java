package com.askknightro.askknightro.dto;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollmentReqDto implements Serializable {
    private Integer studentId;
    private String enrollmentCode;
}
