-- V4__make_chat_message_foreign_keys_nullable.sql

-- 1) Add columns (nullable) if they don't exist
ALTER TABLE chat_message
    ADD COLUMN IF NOT EXISTS student_id INT,
    ADD COLUMN IF NOT EXISTS class_id   INT;

-- 2) Drop constraints by expected names (no-op if not present)
ALTER TABLE chat_message
    DROP CONSTRAINT IF EXISTS fk_chat_message_student,
    DROP CONSTRAINT IF EXISTS fk_chat_message_class;

-- 3) Add FK constraints only if they don't already exist
DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_message_student'
        ) THEN
            ALTER TABLE chat_message
                ADD CONSTRAINT fk_chat_message_student
                    FOREIGN KEY (student_id)
                        REFERENCES student(student_id)
                        ON DELETE SET NULL;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_message_class'
        ) THEN
            ALTER TABLE chat_message
                ADD CONSTRAINT fk_chat_message_class
                    FOREIGN KEY (class_id)
                        REFERENCES class(class_id)
                        ON DELETE SET NULL;
        END IF;
    END
$$;