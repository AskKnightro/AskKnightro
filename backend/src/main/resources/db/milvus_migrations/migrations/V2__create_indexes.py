from pymilvus import MilvusClient

client = MilvusClient(uri="http://standalone:19530")

def create_indexes(collection_name):
    if collection_name not in client.list_collections():
        print(f"Collection '{collection_name}' does not exist.")
        return

    index_params = client.prepare_index_params()
    
    index_params.add_index(field_name="embedding", index_type="IVF_FLAT", metric_type="COSINE", params={"nlist": 128})

    client.create_index(collection_name=collection_name, index_params=index_params)
    print(f"Index created for collection '{collection_name}' with params: {index_params}")
    print(client.list_indexes(collection_name))

# if __name__ == "__main__":
#     create_indexes("embeddings_collection")
