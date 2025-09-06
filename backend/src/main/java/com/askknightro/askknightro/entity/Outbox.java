package com.askknightro.askknightro.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "Outbox")
public class Outbox {

    @Id
    private Integer id;

    private String aggregate;

    @Column(name = "aggregate_id")
    private Integer aggregateId;

    @Column(name = "event_type")
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;
}