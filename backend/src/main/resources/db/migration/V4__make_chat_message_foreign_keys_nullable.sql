-- V4__chat_message_add_columns_and_fks.sql

-- 1) Add columns if missing
ALTER TABLE chat_message
    ADD COLUMN IF NOT EXISTS student_id INT,
    ADD COLUMN IF NOT EXISTS class_id   INT;

-- 2) Make sure they're nullable so ON DELETE SET NULL can work
DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'chat_message' AND column_name = 'student_id' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE chat_message ALTER COLUMN student_id DROP NOT NULL;
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'chat_message' AND column_name = 'class_id' AND is_nullable = 'NO'
        ) THEN
            ALTER TABLE chat_message ALTER COLUMN class_id DROP NOT NULL;
        END IF;
    END $$;

-- 3) Drop any preexisting constraints (no-op if absent)
ALTER TABLE chat_message
    DROP CONSTRAINT IF EXISTS fk_chat_message_student,
    DROP CONSTRAINT IF EXISTS fk_chat_message_class;

-- 4) Recreate FKs if missing
DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_message_student') THEN
            ALTER TABLE chat_message
                ADD CONSTRAINT fk_chat_message_student
                    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE SET NULL;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_chat_message_class') THEN
            ALTER TABLE chat_message
                ADD CONSTRAINT fk_chat_message_class
                    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL;
        END IF;
    END $$;