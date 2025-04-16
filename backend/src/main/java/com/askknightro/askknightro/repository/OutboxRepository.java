package com.askknightro.askknightro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.askknightro.askknightro.entity.Outbox;

import java.util.List;

// Repository Interface used for data interaction of our Course Material table in Postgres
@Repository
public interface OutboxRepository extends JpaRepository<Outbox, Integer> {

    // 1. Save an outbox event (used in service layer to record a new event)
    @Modifying
    @Transactional
    @Query(
            value = "INSERT INTO outbox (aggregate, aggregate_id, event_type, payload, created_at) " +
                    "VALUES (:agg, :aggId, :event, :payload, CURRENT_TIMESTAMP)",
            nativeQuery = true
    )
    void saveEvent(String agg, Integer aggId, String event, String payload);


    // 2. Retrieve unpublished events (used by the background publisher)
    @Query("SELECT o FROM Outbox o WHERE o.publishedAt IS NULL")
    List<Outbox> findUnpublishedEvents();


    // 3. Mark event as published (after successful Milvus deletion)
    @Modifying
    @Transactional
    @Query("UPDATE Outbox o SET o.publishedAt = CURRENT_TIMESTAMP WHERE o.id = :id")
    void markAsPublished(@Param("id") Integer id);
}