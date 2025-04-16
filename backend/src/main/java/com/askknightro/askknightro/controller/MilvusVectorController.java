package com.askknightro.askknightro.controller;


import com.askknightro.askknightro.dto.MilvusVectorDTO;
import com.askknightro.askknightro.vector.MilvusVectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vector")
@RequiredArgsConstructor
public class MilvusVectorController

{

    // Service layer declaration for Controller logic
    private final MilvusVectorService milvusVectorService;


    // Test endpoint that persists data to Milvus Vector Store
    @PostMapping
    public ResponseEntity<String> createCourseMaterialVectorDB(@RequestBody MilvusVectorDTO milvusVectorDTO)
    {
        return milvusVectorService.createCourseMaterialVectorService(milvusVectorDTO.getText(), milvusVectorDTO.getVectorId());  // Calling service layer function
    }

    // Test endpoint that retrieves data from Milvus Vector Store
    @GetMapping("/{vectorId}")
    public ResponseEntity<MilvusVectorDTO> retrieveCourseMaterialVectorDB(@PathVariable String vectorId)
    {
        return milvusVectorService.retrieveCourseMaterialVectorService(vectorId); // Calling service layer function

    }

    // Test endpoint that deletes data from Milvus Vector Store
    @DeleteMapping("/{vectorId}")
    public ResponseEntity<String> deleteCourseMaterialVectorDB(@PathVariable String vectorId)
    {
        return milvusVectorService.deleteCourseMaterialVectorService(vectorId); // Calling Service layer function
    }



}
