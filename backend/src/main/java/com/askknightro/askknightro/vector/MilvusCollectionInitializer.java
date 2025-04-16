package com.askknightro.askknightro.vector;

import io.milvus.client.MilvusServiceClient;
import io.milvus.grpc.DataType;
import io.milvus.param.R;
import io.milvus.param.collection.CollectionSchemaParam;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.FieldType;
import io.milvus.param.collection.HasCollectionParam;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
@RequiredArgsConstructor
// Class used to initialize our collection within Milvus
public class MilvusCollectionInitializer implements CommandLineRunner {

    // Milvus config declaration
    private final MilvusServiceClient milvusClient;

    private static final String COLLECTION_NAME = "vector_store4"; // Name of collection

    @Override
    // Runs on start of our application
    public void run(String... args) {
        createCollectionIfNotExists();
    }

    // Creates Milvus Collection if our client does not find a collection with the declared collection name
    private void createCollectionIfNotExists()
    {
        R<Boolean> hasCollection = milvusClient.hasCollection(
                HasCollectionParam.newBuilder()
                        .withCollectionName(COLLECTION_NAME)
                        .build()
        );

        if (hasCollection.getData())
        {
            System.out.println("Collection already exists: " + COLLECTION_NAME); // Case where collection exists within Milvus
            return;
        }

        System.out.println("Collection not found. Creating collection: " + COLLECTION_NAME);

        List<FieldType> fieldsSchema = new ArrayList<>();

        // Building Collection Columns
        FieldType id =  FieldType.newBuilder()
                .withName("id")
                .withDataType(DataType.VarChar)
                .withMaxLength(128)
                .withPrimaryKey(true)
                .withAutoID(false)
                .build();
        fieldsSchema.add(id);

        FieldType vector = FieldType.newBuilder()
                .withName("embedding")
                .withDataType(DataType.FloatVector)
                .withDimension(1536)
                .build();
        fieldsSchema.add(vector);

        FieldType source = FieldType.newBuilder()
                .withName("source")
                .withDataType(DataType.VarChar)
                .withMaxLength(32)
                .build();
        fieldsSchema.add(source);

        FieldType type =  FieldType.newBuilder()
                .withName("type")
                .withDataType(DataType.VarChar)
                .withMaxLength(32)
                .build();

        fieldsSchema.add(type); // Used to define schema of our Milvus Collection

        // Creation of the Collection structure object
        CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
                .withCollectionName(COLLECTION_NAME)
                .withDescription("AskKnightro Vector Store")
                .withFieldTypes(fieldsSchema)
                .build();

        // Collection creation in Milvus
        milvusClient.createCollection(createCollectionParam);
        System.out.println("Collection created successfully: " + COLLECTION_NAME);
    }
}