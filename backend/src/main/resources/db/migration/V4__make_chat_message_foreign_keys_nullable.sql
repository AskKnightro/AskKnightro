-- V4__make_chat_message_foreign_keys_nullable.sql

-- Drop the existing foreign key constraints
ALTER TABLE Chat_Message
DROP CONSTRAINT IF EXISTS fk_chat_message_student,
DROP CONSTRAINT IF EXISTS fk_chat_message_class;

-- Add them back but allow NULL values (don't enforce for NULL)
ALTER TABLE Chat_Message
ADD CONSTRAINT fk_chat_message_student
    FOREIGN KEY (student_id)
    REFERENCES Student(student_id)
    ON DELETE SET NULL,

ADD CONSTRAINT fk_chat_message_class
    FOREIGN KEY (class_id)
    REFERENCES Class(class_id)
    ON DELETE SET NULL;