-- V5__teacher_identity_link.sql
-- Add Cognito linkage columns to teacher and create indexes/constraints.

-- 1) Add columns (idempotent)
ALTER TABLE public.teacher
    ADD COLUMN IF NOT EXISTS cognito_sub VARCHAR(128),
    ADD COLUMN IF NOT EXISTS cognito_username VARCHAR(128);

-- 2) Unique constraint for cognito_sub, but only when it's not NULL (partial unique index)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_indexes
        WHERE  schemaname = 'public'
          AND  tablename  = 'teacher'
          AND  indexname  = 'ux_teacher_cognito_sub'
    ) THEN
        -- Not using CONCURRENTLY so this can run inside Flyway's transaction
        CREATE UNIQUE INDEX ux_teacher_cognito_sub
            ON public.teacher (cognito_sub)
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
          AND  tablename  = 'teacher'
          AND  indexname  = 'ix_teacher_cognito_username'
    ) THEN
        CREATE INDEX ix_teacher_cognito_username
            ON public.teacher (cognito_username);
    END IF;
END
$$;

-- (Optional) Enforce email uniqueness if not already present
-- DO $$
-- BEGIN
--     IF NOT EXISTS (
--         SELECT 1
--         FROM pg_constraint
--         WHERE conname = 'uq_teacher_email'
--     ) THEN
--         ALTER TABLE public.teacher
--             ADD CONSTRAINT uq_teacher_email UNIQUE (email);
--     END IF;
-- END
-- $$;
