package com.askknightro.askknightro.service;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import org.springframework.stereotype.Component;

@Component
public class MilvusClientService {
    private final MilvusClientV2 milvusClient;

    public MilvusClientService() {
        String host = System.getenv("APP_MILVUS_HOST");
        String port = System.getenv("APP_MILVUS_PORT");

        if (host == null || port == null) {
            throw new IllegalStateException("APP_MILVUS_HOST and APP_MILVUS_PORT must be set");
        }

        String uri = "http://" + host + ":" + port;

        this.milvusClient = new MilvusClientV2(
            ConnectConfig.builder()
                .uri("http://standalone:19530")
                .build()
        );
    }

    public void createCollection(String name) {
        CreateCollectionReq.CollectionSchema schema = milvusClient.createSchema();
        schema.addField(AddFieldReq.builder()
            .fieldName(name)
            .isPrimaryKey(true)
            .autoID(true)
            .build());

        CreateCollectionReq req = CreateCollectionReq.builder()
            .collectionName(name)
            .collectionSchema(schema)
            .build();

        milvusClient.createCollection(req);
    }
}
