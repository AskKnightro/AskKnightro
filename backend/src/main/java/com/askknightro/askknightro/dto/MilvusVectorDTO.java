package com.askknightro.askknightro.dto;

import lombok.*;

@Data // Generates getter and setter methods under the hood
@AllArgsConstructor
@NoArgsConstructor
public class MilvusVectorDTO
{
    private String text;
    private String vectorId;
}
