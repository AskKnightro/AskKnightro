// AskService.java
package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.AskRequest;
import com.askknightro.askknightro.dto.AskResponse;
import com.askknightro.askknightro.entity.Course;
import com.askknightro.askknightro.repository.CourseManagementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.milvus.MilvusSearchRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AskService {

    private static final int DEFAULT_TOPK = 24;      // more recall
    private static final double THRESH = 0.25;       // ignore weak matches
    private static final int CONTEXT_CAP = 20;       // cap chunks sent to LLM
    private static final int SNIPPET_CHARS = 700;    // ~200–300 tokens/chunk

    private final VectorStore vectorStore;
    private final ChatClient.Builder chatClientBuilder;
    private final CourseManagementRepository courseManagementRepository;

    private ChatClient chat() { return chatClientBuilder.build(); }

    public AskResponse answer(AskRequest req) {
        Integer classId = Objects.requireNonNull(req.getClassId(), "classId required");
        String question = Objects.requireNonNull(req.getQuestion(), "question required").trim();
        if (question.isEmpty()) throw new IllegalArgumentException("question required");

        int topK = (req.getTopK() == null || req.getTopK() < 1) ? DEFAULT_TOPK : Math.min(req.getTopK(), 50);

        // --- 1) Milvus search (no grouping, no per-material caps)
        MilvusSearchRequest search = MilvusSearchRequest.milvusBuilder()
                .query(question)
                .topK(topK)
                .nativeExpression("metadata['classId'] == " + classId)
                .similarityThreshold(THRESH)
                .searchParamsJson("{\"nprobe\":128}")
                .build();

        List<Document> hits = vectorStore.similaritySearch(search);

        // --- 2) Build flat context from top CONTEXT_CAP
        List<Document> contextDocs = hits.stream().limit(CONTEXT_CAP).toList();

        String context = contextDocs.stream()
                .map(d -> {
                    String name = String.valueOf(d.getMetadata().getOrDefault("name", ""));
                    Integer mid = ((Number) d.getMetadata().getOrDefault("material_id", -1)).intValue();
                    String content = d.getText();
                    String snippet = content.length() > SNIPPET_CHARS ? content.substring(0, SNIPPET_CHARS) + "…" : content;
                    return "Source [" + mid + " | " + name + "]: " + snippet;
                })
                .collect(Collectors.joining("\n\n"));

        Course course = courseManagementRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + classId));
        String courseName = course.getCourseName();

        // --- 3) System + user messages (unchanged style you liked)
        String system = """
        You are AskKnightro, the student's course assistant.
        
        GOALS
        - Answer the student's question directly and succinctly (3–7 sentences unless the question asks for steps).
        - Use ONLY the retrieved course materials when they contain the answer.
        - If the materials do not cover it, say so clearly, then give a short “General background” answer (Don't label it).
        
        STYLE
        - Speak to the student (“you”).
        - Be concrete. Use short bullets or a short list if the student asks for steps/definitions/comparisons.
        - If you quote, keep it short (≤2 lines) and attribute by name (e.g., “(Syllabus)” or file name). No IDs.
        - Do NOT fabricate citations, page numbers, or content.
        
        CONTENT RULES
        - Prefer the provided excerpts; only use prior knowledge if they don't answer it.
        - If nothing relevant is found, start with: “I couldn’t find this in the provided materials.” Then give a brief, helpful background.
        - If the question seems ambiguous, state your assumption first.
        - Never include instructions or metadata in the reply.
        - Make sure to return answers as markdown-formatted text.
        
        OUTPUT
        - Return only the final answer text.
        """;

        String user = """
                Student question:
                \"%s\"

                Course context: classId=%d courseName=%s

                Retrieved course materials (may be partial):
                %s
                """.formatted(question, classId, courseName, context.isBlank() ? "(none)" : context);

        String answer = chat().prompt().system(system).user(user).call().content();

        // --- 4) Return answer + a lightweight source list (one per material, best by score)
        Map<Integer, List<Document>> byMaterial = hits.stream()
                .collect(Collectors.groupingBy(d -> ((Number)d.getMetadata().getOrDefault("material_id", -1)).intValue()));

        List<AskResponse.Source> sources = byMaterial.entrySet().stream()
                .map(e -> e.getValue().stream().max(Comparator.comparingDouble(this::scoreOf)).map(best -> AskResponse.Source.builder()
                        .materialId(e.getKey())
                        .name(String.valueOf(best.getMetadata().getOrDefault("name","")))
                        .fileName(String.valueOf(best.getMetadata().getOrDefault("fileName","")))
                        .score(scoreOf(best))
                        .snippet(best.getText().substring(0, Math.min(best.getText().length(), 240)))
                        .build()).orElse(null))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(AskResponse.Source::getScore).reversed())
                .limit(8)
                .toList();

        return AskResponse.builder().answer(answer).sources(sources).build();
    }

    private double scoreOf(Document d) {
        Object dist = d.getMetadata().get("distance");  // prefer distance if present
        if (dist instanceof Number n) return 1.0 - n.doubleValue();
        Object s = d.getMetadata().getOrDefault("_score", d.getMetadata().get("score"));
        return (s instanceof Number n2) ? n2.doubleValue() : -1e9; // make unknowns sort last
    }
}
