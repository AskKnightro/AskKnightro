-- V9__insert_test_data.sql
-- Insert test data safely: teachers, students, courses, and enrollments

-- Insert Teachers
INSERT INTO teacher (name, email, password, department, bio)
SELECT 'Dr. John Smith', 'john.smith@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Computer Science', 'Experienced professor with 15 years of teaching experience in algorithms and data structures.'
WHERE NOT EXISTS (SELECT 1 FROM teacher WHERE email = 'john.smith@ucf.edu');

INSERT INTO teacher (name, email, password, department, bio)
SELECT 'Dr. Sarah Johnson', 'sarah.johnson@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Mathematics', 'PhD in Applied Mathematics, specializing in linear algebra and calculus.'
WHERE NOT EXISTS (SELECT 1 FROM teacher WHERE email = 'sarah.johnson@ucf.edu');

INSERT INTO teacher (name, email, password, department, bio)
SELECT 'Prof. Michael Chen', 'michael.chen@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Engineering', 'Expert in software engineering and system design.'
WHERE NOT EXISTS (SELECT 1 FROM teacher WHERE email = 'michael.chen@ucf.edu');

-- Insert Students
INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Alice Johnson', 'alice.johnson@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Computer Science', 'Junior', 'S12345678', 'College of Engineering and Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'alice.johnson@ucf.edu');

INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Bob Williams', 'bob.williams@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Mathematics', 'Senior', 'S12345679', 'College of Sciences'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'bob.williams@ucf.edu');

INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Charlie Brown', 'charlie.brown@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Engineering', 'Sophomore', 'S12345680', 'College of Engineering and Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'charlie.brown@ucf.edu');

INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Diana Prince', 'diana.prince@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Computer Science', 'Junior', 'S12345681', 'College of Engineering and Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'diana.prince@ucf.edu');

INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Edward Norton', 'edward.norton@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Mathematics', 'Senior', 'S12345682', 'College of Sciences'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'edward.norton@ucf.edu');

INSERT INTO student (name, email, password, major, year_standing, school_id, university_college)
SELECT 'Fiona Apple', 'fiona.apple@ucf.edu', '$2a$10$YourHashedPassword123456789', 'Engineering', 'Freshman', 'S12345683', 'College of Engineering and Computer Science'
WHERE NOT EXISTS (SELECT 1 FROM student WHERE email = 'fiona.apple@ucf.edu');

-- Insert Courses
INSERT INTO class (enrollment_code, course_name, semester, teacher_id, course_description)
SELECT 'CS4010-001', 'Introduction to Algorithms', 'Fall 2024', t.teacher_id, 'Intro to algorithms and data structures.'
FROM (SELECT teacher_id FROM teacher WHERE email='john.smith@ucf.edu') t
WHERE NOT EXISTS (SELECT 1 FROM class WHERE enrollment_code='CS4010-001');

INSERT INTO class (enrollment_code, course_name, semester, teacher_id, course_description)
SELECT 'CS5010-001', 'Advanced Data Structures', 'Fall 2024', t.teacher_id, 'Deep dive into advanced data structures.'
FROM (SELECT teacher_id FROM teacher WHERE email='john.smith@ucf.edu') t
WHERE NOT EXISTS (SELECT 1 FROM class WHERE enrollment_code='CS5010-001');

INSERT INTO class (enrollment_code, course_name, semester, teacher_id, course_description)
SELECT 'MATH2102-001', 'Linear Algebra I', 'Fall 2024', t.teacher_id, 'Vectors, matrices, and linear transformations.'
FROM (SELECT teacher_id FROM teacher WHERE email='sarah.johnson@ucf.edu') t
WHERE NOT EXISTS (SELECT 1 FROM class WHERE enrollment_code='MATH2102-001');

INSERT INTO class (enrollment_code, course_name, semester, teacher_id, course_description)
SELECT 'COP4338-001', 'Software Engineering', 'Fall 2024', t.teacher_id, 'Software engineering principles and project management.'
FROM (SELECT teacher_id FROM teacher WHERE email='michael.chen@ucf.edu') t
WHERE NOT EXISTS (SELECT 1 FROM class WHERE enrollment_code='COP4338-001');

-- Insert Enrollments
INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='alice.johnson@ucf.edu' AND c.enrollment_code='CS4010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='alice.johnson@ucf.edu' AND c.enrollment_code='CS5010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='bob.williams@ucf.edu' AND c.enrollment_code='MATH2102-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='bob.williams@ucf.edu' AND c.enrollment_code='CS4010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='charlie.brown@ucf.edu' AND c.enrollment_code='COP4338-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='diana.prince@ucf.edu' AND c.enrollment_code='CS4010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='diana.prince@ucf.edu' AND c.enrollment_code='CS5010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='edward.norton@ucf.edu' AND c.enrollment_code='MATH2102-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);

INSERT INTO enrollment (student_id, class_id, time_created)
SELECT s.student_id, c.class_id, NOW()
FROM student s, class c
WHERE s.email='fiona.apple@ucf.edu' AND c.enrollment_code='CS4010-001'
AND NOT EXISTS (
    SELECT 1 FROM enrollment e WHERE e.student_id=s.student_id AND e.class_id=c.class_id
);
