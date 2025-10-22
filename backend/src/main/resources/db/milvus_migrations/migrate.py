import importlib.util
import os


MIGRATIONS_MODULE_PATH = os.path.join(os.path.dirname(__file__), "migrations")

def migrate():
    migration_files = sorted(f for f in os.listdir(MIGRATIONS_MODULE_PATH) if f.endswith(".py"))

    for file in migration_files:
        path = os.path.join(MIGRATIONS_MODULE_PATH, file)
        spec = importlib.util.spec_from_file_location("migration_module", path)
        migration_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(migration_module)

        if hasattr(migration_module, "create_collections"):
            migration_module.create_collections("materials_chunks")
        if hasattr(migration_module, "create_indexes"):
            migration_module.create_indexes("materials_chunks")
        if hasattr(migration_module, "smoke_test_insert"):
            migration_module.smoke_test_insert("materials_chunks")

        print(f"Executed migration: {file}")

if __name__ == "__main__":
    migrate()


