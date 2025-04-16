package com.askknightro.askknightro.vector;

import com.askknightro.askknightro.dto.MilvusVectorDTO;
import com.askknightro.askknightro.exception.VectorStoreException;
import io.milvus.client.MilvusServiceClient;
import io.milvus.grpc.DescribeCollectionResponse;
import io.milvus.param.R;
import io.milvus.param.collection.DescribeCollectionParam;
import io.milvus.param.collection.ShowCollectionsParam;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.milvus.MilvusVectorStore;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.ai.document.Document;

import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class MilvusVectorService
{

    private final MilvusServiceClient milvusServiceClient;
    private final MilvusVectorStore milvusVectorStore;



    // Method for adding a vector into Milvus db
    public ResponseEntity<String> createCourseMaterialVectorService(String text, String vectorId)
    {
        // Convert String into Document object for persistence
        Document document = new Document(vectorId, text, Map.of("id", vectorId,"source", "upload", "type", "notes")); // Creates relationship between inserted String and associated metadata i.e. vector id

        try
        {
            R<DescribeCollectionResponse> respDescribeCollection = milvusServiceClient.describeCollection(
                    // Return the name and schema of the collection for testing purposes
                    DescribeCollectionParam.newBuilder()
                            .withCollectionName("vector_store")
                            .build());
            System.out.println("Document being inserted: " + document);
            System.out.println(milvusServiceClient.showCollections(ShowCollectionsParam.newBuilder().build()));
            System.out.println(respDescribeCollection.toString());

            milvusVectorStore.add(List.of(document)); // Actual persistence of vector -> Spring AI abstracts the embedding process


            return ResponseEntity.status(200).body("Vector with vector id: " + vectorId + " has been persisted to Milvus"); // Success
        }

        // Error Handling
        catch(Exception ex)
        {
            throw new VectorStoreException("Failed to embed and store documents in Milvus", ex);
        }
    }

    // Method for retrieving Documents from the Milvus DB
    public ResponseEntity<MilvusVectorDTO> retrieveCourseMaterialVectorService(String vectorId) {
        try {

            String filterExpr = "id == \"" + vectorId + "\""; // Format for filter expression
            SearchRequest request = SearchRequest.builder()
                    .query("Sample Query")
                    .topK(1)
                    .similarityThreshold(0.0)
                    .filterExpression(filterExpr)
                    .build();

            // Execute search to see if vector we want to retrieve exists
            List<Document> results = milvusVectorStore.similaritySearch(request);

            // Validation Handling
            if (results == null || results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Retrieving result (Only retrieving a single vector)
            Document doc = results.get(0);
            MilvusVectorDTO dto = new MilvusVectorDTO(doc.getId(), doc.getText());

            return ResponseEntity.ok(dto); // Success Case
        }

        catch (Exception ex)
        {
            throw new VectorStoreException("Failed to retrieve documents from Milvus", ex);
        }
    }

    // Method for deleting a document from the Milvus DB
    public ResponseEntity<String> deleteCourseMaterialVectorService(String vectorId) {
        try {
            String filterExpr = "id == \"" + vectorId + "\""; // Format for filter expression
            SearchRequest request = SearchRequest.builder()
                    .query("Sample Query")
                    .topK(1)
                    .similarityThreshold(0.0)
                    .filterExpression(filterExpr)
                    .build();

            // Execute search to see if vector we want exists
            List<Document> results = milvusVectorStore.similaritySearch(request);

            // Validation handling
            if (results == null || results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // Retrieving result (Only retrieving a single vector)
            Document document = results.get(0);
            MilvusVectorDTO milvusVectorDTO = new MilvusVectorDTO(document.getId(), document.getText());
            System.out.println("This is the Milvus Vector DTO: " + milvusVectorDTO.getVectorId() + " " + milvusVectorDTO.getText());


            // Vector deletion
            milvusVectorStore.delete(List.of(vectorId));
            System.out.println("Vector has been deleted with id :" + vectorId);

            return ResponseEntity.status(200).body("The following vector has been deleleted" + milvusVectorDTO); // Success Case
        }
        catch (Exception e)
        {
            throw new VectorStoreException("Failed to delete vector from Milvus", e);
        }
    }
}
