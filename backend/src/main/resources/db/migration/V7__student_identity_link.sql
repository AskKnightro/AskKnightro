-- V4__student_identity_link.sql
-- Add Cognito linkage columns to student and create indexes/constraints.

-- 1) Add columns (idempotent)
ALTER TABLE public.student
    ADD COLUMN IF NOT EXISTS cognito_sub VARCHAR(128),
    ADD COLUMN IF NOT EXISTS cognito_username VARCHAR(128);

-- 2) Unique constraint for cognito_sub, but only when it's not NULL (partial unique index)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_indexes
        WHERE  schemaname = 'public'
        AND    tablename  = 'student'
        AND    indexname  = 'ux_student_cognito_sub'
    ) THEN
        -- Note: not using CONCURRENTLY so this can run inside Flyway's transaction.
        CREATE UNIQUE INDEX ux_student_cognito_sub
            ON public.student (cognito_sub)
            WHERE cognito_sub IS NOT NULL;
    END IF;
END
$$;

-- 3) Lookup index for admin operations by username (non-unique)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_indexes
        WHERE  schemaname = 'public'
        AND    tablename  = 'student'
        AND    indexname  = 'ix_student_cognito_username'
    ) THEN
        CREATE INDEX ix_student_cognito_username
            ON public.student (cognito_username);
    END IF;
END
$$;

-- (Optional) If you don't already enforce email uniqueness, you can add this:
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1 FROM pg_constraint
--         WHERE conname = 'uq_student_email'
--     ) THEN
--         ALTER TABLE public.student
--             ADD CONSTRAINT uq_student_email UNIQUE (email);
--     END IF;
-- END
-- $$;
