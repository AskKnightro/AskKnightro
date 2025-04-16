package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.CourseMaterialDTO;
import com.askknightro.askknightro.service.CourseMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseMaterialController
{


    // Service layer declarations for Controller logic
    private final CourseMaterialService courseMaterialService;



    // Test endpoint for Course Material creation in Postgres and Milvus DB
    @PostMapping
    public ResponseEntity<String> createCourseMaterial(@RequestBody CourseMaterialDTO courseMaterialDTO) {
        return courseMaterialService.createCourseMaterial(courseMaterialDTO);
    }




    // Test endpoint for retrieving Course Material from Postgres DB
    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterialDTO> getCourseMaterial(@PathVariable Integer id) // Taking in id from request
    {

        // Calling Service Function to retrieve Course DTO
        CourseMaterialDTO courseMaterialDTO = courseMaterialService.retrieveCourseMaterial(id);
        return ResponseEntity.ok(courseMaterialDTO);
    }



    // TODO -> Create endpoint that updates Course Materials in the Postgres and Milvus DB's



    // Test endpoint for deleting Course Materials from the Vector and Postgres db
    @DeleteMapping("/{courseId}")
    public ResponseEntity<String> deleteCourseMaterial(@PathVariable Integer courseId)
    {
        return courseMaterialService.deleteCourseMaterial(courseId); // Returning service level function
    }



}
