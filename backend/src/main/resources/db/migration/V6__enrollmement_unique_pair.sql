-- Unique (student_id, class_id) so a student can enroll only once in a class
ALTER TABLE enrollment
    ADD CONSTRAINT uq_enrollment_student_class UNIQUE (student_id, class_id);