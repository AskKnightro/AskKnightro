package com.askknightro.askknightro.service;

import com.askknightro.askknightro.exception.NotFoundException;
import com.askknightro.askknightro.dto.CourseMaterialDTO;
import com.askknightro.askknightro.entity.CourseMaterial;
import com.askknightro.askknightro.repository.CourseMaterialRepository;
import com.askknightro.askknightro.repository.OutboxRepository;
import com.askknightro.askknightro.vector.MilvusVectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseMaterialService
{

    // Service/Repo declarations needed for Service layer business logic
    private final CourseMaterialRepository courseMaterialRepository;
    private final MilvusVectorService milvusVectorService;
    private final OutboxRepository outboxRepository;



    @Transactional
    // Service layer function for creating a course
    public ResponseEntity<String> createCourseMaterial(CourseMaterialDTO courseMaterialDTO) {
        try {
            // Create the CourseMaterial Entity from incoming DTO
            CourseMaterial entity = new CourseMaterial();
            entity.setId(courseMaterialDTO.getId());
            entity.setName(courseMaterialDTO.getName());
            entity.setVectorId(courseMaterialDTO.getVectorId());
            entity.setClassIid(courseMaterialDTO.getClassId());
            entity.setIsDeleted(false);
            entity.setDeletedAt(null);

            // Saving Entity to Postgres via Repository Interface
            courseMaterialRepository.save(entity);

            // Saving Course Material to Milvus
            milvusVectorService.createCourseMaterialVectorService(courseMaterialDTO.getName(), courseMaterialDTO.getVectorId());


            return ResponseEntity.ok("Course Material saved with ID: " + entity.getId()); // Success case
        }
        catch (Exception e)
        {
            throw new RuntimeException("Failed to save course material", e); // Fail case
        }
    }


    // Service layer logic for retrieving course material by id from Postgres datastore
    public CourseMaterialDTO retrieveCourseMaterial(Integer id)
    {

        // Interaction with the Repository Interface to retrieve Course Material Entity
        CourseMaterial courseMaterialEntity = courseMaterialRepository.findById(id).orElseThrow(() -> new NotFoundException("Course Material with id " + id + " not found"));

        // Building and returning CourseMaterialDTO
        return new CourseMaterialDTO(courseMaterialEntity.getId(), courseMaterialEntity.getName(), courseMaterialEntity.getVectorId(), courseMaterialEntity.getClassIid(), courseMaterialEntity.getIsDeleted(), courseMaterialEntity.getDeletedAt());
    }


    @Transactional
    public ResponseEntity<String> deleteCourseMaterial(Integer courseMaterialId) {

        // Retrieving Course Material from Postgres DB
        CourseMaterial courseMaterial = courseMaterialRepository.findById(courseMaterialId)
                .orElseThrow(() -> new NotFoundException("Course Material not found: " + courseMaterialId));

//        // Soft delete in Postgres
//        courseMaterial.setIsDeleted(true);
//        courseMaterial.setDeletedAt(LocalDateTime.now());
//        courseMaterialRepository.save(courseMaterial);

        String payload = buildPayload(courseMaterial);

        // hard delete call would look something like this below
        courseMaterialRepository.deleteById(courseMaterialId);

        // Save delete event to Outbox Table to be relayed to our Outbox publisher
        System.out.println("Saving outbox event for courseMaterialId: " + courseMaterialId);
        outboxRepository.saveEvent(
                "Course_Material",
                courseMaterialId,
                "DELETE",
                payload // includes vectorId
        );

        // Success case
        return ResponseEntity.ok(
                "Course material with ID " + courseMaterialId +
                        " has been soft-deleted and a deletion event has been queued."
        );
    }


    // Helper method for Outbox Pattern
    private String buildPayload(CourseMaterial courseMaterial) {
        return String.format("{\"id\": %d, \"vector_id\": \"%s\", \"name\": \"%s\"}",
                courseMaterial.getId(), courseMaterial.getVectorId(), courseMaterial.getName());
    }

}
