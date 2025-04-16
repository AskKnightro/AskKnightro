package com.askknightro.askknightro.vector;

import com.askknightro.askknightro.entity.Outbox;
import com.askknightro.askknightro.repository.OutboxRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class MilvusOutboxPublisher
{

    private final OutboxRepository outboxRepository;
    private final MilvusVectorService milvusVectorService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // for parsing payload

    @Scheduled(fixedDelay = 5000) // Initializes background thread that is independent of our workflows -> runs every 5 seconds
    @Transactional
    public void publishMilvusDeleteEvents() {

        // Extracting events from Outbox Repo
        List<Outbox> events = outboxRepository.findUnpublishedEvents();

        for (Outbox event : events) {

            // Skip through non Milvus-related deletes
            if (!event.getAggregate().equals("Course_Material") || !event.getEventType().equals("DELETE"))
            {
                continue;
            }

            try {
                // Parse vector ID from payload
                JsonNode payloadNode = objectMapper.readTree(event.getPayload());
                String vectorId = payloadNode.get("vector_id").asText();

                System.out.println("About to delete vector id");

                // Delete from Milvus
                milvusVectorService.deleteCourseMaterialVectorService(vectorId);

                // Mark event as processed so when our background thread runs we skip
                outboxRepository.markAsPublished(event.getId());

            }
            catch (Exception e)
            {
                System.err.println("Failed to process Outbox ID " + event.getId());
                e.printStackTrace();
            }
        }
    }
}
