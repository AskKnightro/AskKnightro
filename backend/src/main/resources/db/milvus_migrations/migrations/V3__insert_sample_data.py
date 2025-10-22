from pymilvus import MilvusClient
import random

client = MilvusClient(
    uri="http://standalone:19530"
)

def _vec(dim=1536):
    # For a smoke test, random is fine; for real use, embed real text
    return [random.uniform(-1, 1) for _ in range(dim)]

def smoke_test_insert(collection_name: str):
    if collection_name not in client.list_collections():
        raise RuntimeError(f"Collection '{collection_name}' does not exist. Run create_collections first.")

    row = {
        "embedding": _vec(),
        "material_id": 12345,
        "chunk_ix": 0,
        "class_id": 678,
        "semester": "Fall-2025",
        "text": "This is a test chunk for smoke testing only.",
        "meta": {"file_name": "Test.pdf", "page": 1, "section_title": "Intro", "doc_id": "test-uuid"}
    }
    res = client.insert(collection_name=collection_name, data=[row])
    print("Inserted test row:", res)
    return res

# if __name__ == "__main__":
#     create_sample_data("test_collection")
