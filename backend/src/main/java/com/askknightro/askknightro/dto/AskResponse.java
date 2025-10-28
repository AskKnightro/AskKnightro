package com.askknightro.askknightro.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class AskResponse {
    private String answer;
    private List<Source> sources;

    @Data @Builder
    public static class Source {
        private Integer materialId;
        private String name;
        private String fileName;
        private double score;
        private String snippet;
    }
}