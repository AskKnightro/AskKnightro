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
            migration_module.create_collections("final_test")
        if hasattr(migration_module, "create_indexes"):
            migration_module.create_indexes("final_test")
        if hasattr(migration_module, "create_sample_data"):
            migration_module.create_sample_data("final_test")

        print(f"Executed migration: {file}")

if __name__ == "__main__":
    migrate()


