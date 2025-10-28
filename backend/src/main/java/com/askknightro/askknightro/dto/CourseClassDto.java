package com.askknightro.askknightro.dto;


import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseClassDto {
    private Integer classId;
    private String enrollmentCode;
    private String courseName;
    private String semester;
    private Integer teacherId;
    private String courseDescription;
    private String shardId;
}
