from pymilvus import MilvusClient
import random

client = MilvusClient(
    uri="http://standalone:19530"
)

def generate_vector(dim=1536):
    return [random.uniform(-1, 1) for _ in range(dim)]

def create_sample_data(collection_name: str):
    # Check if collection exists
    if collection_name not in client.list_collections():
        print(f"Collection '{collection_name}' does not exist. Creating it with dimension 5.")
        client.create_collection(collection_name=collection_name, dimension=5)

    # Sample data
    sample_vectors = [
        {"embedding": generate_vector(), "metadata": "sample 1"},
        {"embedding": generate_vector(), "metadata": "sample 2"},
        {"embedding": generate_vector(), "metadata": "sample 3"}
    ]

    # Insert data
    for item in sample_vectors:
        res = client.insert(collection_name=collection_name, data=item)
        print(f"Inserted: {item['metadata']} -> {res}")

    print(f"Sample data inserted into '{collection_name}'.")

# if __name__ == "__main__":
#     create_sample_data("test_collection")
