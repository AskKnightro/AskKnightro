from pymilvus import FieldSchema, CollectionSchema, DataType, MilvusClient

client = MilvusClient(uri="http://standalone:19530")


def create_collections(collection_name):

    if collection_name in client.list_collections():
        print(f"Collection '{collection_name}' already exists.")
        return

    # Define the schema for the collection
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=1536),
        FieldSchema(name="metadata", dtype=DataType.VARCHAR, max_length=65535)
    ]
    schema = CollectionSchema(fields, description="Collection for storing embeddings and metadata")

    # Create the collection
    client.create_collection(collection_name=collection_name, schema=schema)
    print(f"Collection '{collection_name}' created with schema: {schema}")

# if __name__ == "__main__":
#     create_collections("test_collection")