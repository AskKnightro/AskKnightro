package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.CourseMaterialDto;
import com.askknightro.askknightro.entity.Course;
import com.askknightro.askknightro.entity.CourseMaterial;
import com.askknightro.askknightro.repository.CourseManagementRepository;
import com.askknightro.askknightro.repository.CourseMaterialRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.document.MetadataMode;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseMaterialService {

    private static final int BATCH = 32;
    private static final int CONCURRENCY = 1;
    private final TokenTextSplitter splitter;   // from AiConfig
    private final VectorStore vectorStore;
    private final CourseManagementRepository courseManagementRepository;
    private final CourseMaterialRepository courseMaterialRepository;


    // ---------- CREATE ----------
    @Transactional
    protected CourseMaterial createRow(Integer classId, String name) {
        Course course = courseManagementRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + classId));

        CourseMaterial material = CourseMaterial.builder()
                .courseClass(course)
                .name(name)
                .isDeleted(false)
                .build();

        return courseMaterialRepository.saveAndFlush(material); // ID now set
    }

    public CourseMaterialDto createCourseMaterial(Integer classId, MultipartFile file, String name) {
        try {

            // 1) create DB row to get generated id
            CourseMaterial material = createRow(classId, name);
            Integer materialId = material.getId(); // not null now


            // 2) split + embed (no TX)
            String text = new String(file.getBytes(), StandardCharsets.UTF_8);
            var baseMeta = new HashMap<String,Object>();
            baseMeta.put("classId", classId);
            baseMeta.put("name", (name != null && !name.isBlank()) ? name : file.getOriginalFilename());
            baseMeta.put("fileName", file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
            baseMeta.put("material_id", materialId);

            List<Document> chunks = splitter.apply(List.of(new Document(text, baseMeta)));

            // ---- 4) Insert into VectorStore in batches ----
            var batches = partition(chunks, BATCH);
            var pool = Executors.newFixedThreadPool(CONCURRENCY);
            try {
                for (List<Document> batch : batches) {
                    pool.submit(() -> vectorStore.add(batch)).get(); // serialize for stability
                }
            } finally {
                pool.shutdown();
            }

            // 3) finalize/update if needed
            return toDto(material);
        } catch (Exception e) {
            log.error("Failed to process uploaded material", e);
            throw new RuntimeException("Failed to process uploaded material", e);
        }
    }


    // ---------- READ ----------
    public CourseMaterialDto getMaterial(Integer id) {
        CourseMaterial m = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));
        return toDto(m);
    }

    public List<CourseMaterialDto> listByClass(Integer classId) {
        return courseMaterialRepository
                .findByCourseClass_ClassIdAndIsDeletedFalse(classId)
                .stream().map(this::toDto).toList();
    }

    // ---------- UPDATE ----------
    // Supports renaming and optional file replacement (re-embeds if file provided)
    @Transactional
    public CourseMaterialDto updateMaterial(Integer id, String newName, MultipartFile newFileOrNull) {
        try {
            CourseMaterial m = courseMaterialRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Material not found: " + id));

            // If only renaming: update DB name (vector metadata will be stale until re-embed)
            if (newFileOrNull == null) {
                if (newName != null && !newName.isBlank()) {
                    m.setName(newName);
                    m = courseMaterialRepository.save(m);
                }
                return toDto(m);
            }

            // Replacing content: delete old embeddings then re-embed new content
            deleteEmbeddingsForMaterial(id);

            String text = new String(newFileOrNull.getBytes(), StandardCharsets.UTF_8);
            String filename = newFileOrNull.getOriginalFilename();

            if (newName != null && !newName.isBlank()) m.setName(newName);

            Map<String,Object> meta = new HashMap<>();
            meta.put("classId", m.getCourseClass().getClassId());
            meta.put("name", (newName != null && !newName.isBlank()) ? newName : filename);
            meta.put("fileName", filename == null ? "" : filename);
            meta.put("material_id", id);

            List<Document> chunks = splitter.apply(List.of(new Document(text, meta)));
            for (List<Document> batch : partition(chunks, BATCH)) {
                vectorStore.add(batch);
            }

            m = courseMaterialRepository.save(m);
            return toDto(m);
        } catch (Exception e) {
            log.error("Failed to update material {}", id, e);
            throw new RuntimeException("Failed to update material " + id, e);
        }
    }

    // ---------- DELETE ----------
    // soft=false => hard delete (DB row + embeddings)
    // soft=true  => mark deleted in DB + delete embeddings
    @Transactional
    public void deleteMaterial(Integer id, boolean soft) {
        CourseMaterial m = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found: " + id));

        // remove embeddings for this material
        deleteEmbeddingsForMaterial(id);

        if (soft) {
            m.setIsDeleted(true);
            m.setDeletedAt(LocalDateTime.now());
            courseMaterialRepository.save(m);
        } else {
            courseMaterialRepository.delete(m);
        }
    }


    // -------- Helpers --------
    private void deleteEmbeddingsForMaterial(Integer materialId) {
        // Delete by metadata filter: material_id == <id>
        Filter.Expression filter = new Filter.Expression(
                Filter.ExpressionType.EQ,
                new Filter.Key("material_id"),
                new Filter.Value(materialId)
        );

        vectorStore.delete(filter);
    }

    private void deleteEmbeddingsForClass(Integer classId) {
        // Delete by metadata filter: classId == <classId>
        Filter.Expression filter = new Filter.Expression(
                Filter.ExpressionType.EQ,
                new Filter.Key("classId"),
                new Filter.Value(classId)
        );

        vectorStore.delete(filter);
    }

    private CourseMaterialDto toDto(CourseMaterial m) {
        return CourseMaterialDto.builder()
                .id(m.getId())
                .classId(m.getCourseClass() != null ? m.getCourseClass().getClassId() : null)
                .name(m.getName())
                .vectorId(m.getVectorId())
                .isDeleted(Boolean.TRUE.equals(m.getIsDeleted()))
                .deletedAt(m.getDeletedAt())
                .build();
    }

    private static <T> List<List<T>> partition(List<T> list, int size) {
        List<List<T>> out = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            out.add(list.subList(i, Math.min(list.size(), i + size)));
        }
        return out;
    }


}


