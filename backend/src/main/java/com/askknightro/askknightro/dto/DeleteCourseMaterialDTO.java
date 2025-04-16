package com.askknightro.askknightro.dto;

import lombok.*;


@Data // Generates getter and setter methods under the hood
@AllArgsConstructor
@NoArgsConstructor
public class DeleteCourseMaterialDTO
{
    private Integer courseMaterialID; // Handles incoming request course material id

}
