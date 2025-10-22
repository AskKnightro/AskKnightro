from pymilvus import FieldSchema, CollectionSchema, DataType, MilvusClient

client = MilvusClient(uri="http://standalone:19530")


def create_collections(collection_name="materials_chunks"):
    if collection_name in client.list_collections():
        print(f"Collection '{collection_name}' already exists.")
        return

    fields = [
        FieldSchema(name="id",          dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="embedding",   dtype=DataType.FLOAT_VECTOR, dim=1536),

        # scalar fields for filtering / deletes / ordering
        FieldSchema(name="material_id", dtype=DataType.INT64),       # parent course_material.id
        FieldSchema(name="chunk_ix",    dtype=DataType.INT64),       # 0..N within file
        FieldSchema(name="class_id",    dtype=DataType.INT64),       # course filter (optional but useful)
        FieldSchema(name="semester",    dtype=DataType.VARCHAR, max_length=32),

        # store chunk text here for MVP (since you're skipping Postgres chunks)
        FieldSchema(name="text",        dtype=DataType.VARCHAR, max_length=65535),

        # flexible extras you won't frequently filter on
        FieldSchema(name="meta",        dtype=DataType.JSON),        # file_name, page, section_title, doc_id, etc.
    ]

    schema = CollectionSchema(fields, description="AskKnightro course material chunk embeddings")
    client.create_collection(collection_name=collection_name, schema=schema)
    print(f"Collection '{collection_name}' created with schema '{schema}'")

    # (optional) build a vector index now; comment out if you do this elsewhere
    idx = client.prepare_index_params()
    idx.add_index(field_name="embedding", index_type="HNSW", metric_type="COSINE",
                  params={"M": 24, "efConstruction": 200})
    client.create_index(collection_name=collection_name, index_params=idx)
    print("Vector index (HNSW/COSINE) created.")

# if __name__ == "__main__":
#     create_collections("test_collection")