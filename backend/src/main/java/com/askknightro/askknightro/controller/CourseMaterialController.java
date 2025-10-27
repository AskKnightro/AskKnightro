package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.CourseMaterialDto;
import com.askknightro.askknightro.service.CourseMaterialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RequestMapping("/api/materials")
@RestController
@RequiredArgsConstructor
@Slf4j
public class CourseMaterialController {

    private final CourseMaterialService courseMaterialService;

    // CREATE (existing)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<CourseMaterialDto> create(
            @RequestParam Integer classId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String name
    ) {
        CourseMaterialDto dto = courseMaterialService.createCourseMaterial(classId, file, name);
        return ResponseEntity.ok(dto);
    }

    // READ one
    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterialDto> getOne(@PathVariable Integer id) {
        return ResponseEntity.ok(courseMaterialService.getMaterial(id));
    }

    // READ list by class
    @GetMapping
    public ResponseEntity<List<CourseMaterialDto>> listByClass(@RequestParam Integer classId) {
        return ResponseEntity.ok(courseMaterialService.listByClass(classId));
    }

    // PATCH: rename and/or replace file (multipart; both optional)
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseMaterialDto> patch(
            @PathVariable Integer id,
            @RequestParam(required = false) String name,
            @RequestPart(value = "file", required = false) MultipartFile newFile) {
        return ResponseEntity.ok(courseMaterialService.updateMaterial(id, name, newFile));
    }

    // DELETE (soft by default; pass ?hard=true to hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "false") boolean soft) {
        courseMaterialService.deleteMaterial(id, soft);
        return ResponseEntity.noContent().build();
    }




}
