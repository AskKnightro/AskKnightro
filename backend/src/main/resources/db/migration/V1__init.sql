-- DDL for AskKnightro

CREATE TABLE Teacher (
                         teacher_id       INT PRIMARY KEY,
                         name             VARCHAR(255),
                         email            VARCHAR(255),
                         department       VARCHAR(255),
                         profile_picture  VARCHAR(255),
                         password         VARCHAR(255),   -- encrypted
                         bio              TEXT
);

CREATE TABLE Student (
                         student_id       INT PRIMARY KEY,
                         name             VARCHAR(255),
                         email            VARCHAR(255),
                         password         VARCHAR(255),   -- encrypted
                         profile_picture  VARCHAR(255),
                         year_standing    VARCHAR(50),
                         major            VARCHAR(100),
                         grad_date        DATE,
                         school_id        VARCHAR(50),
                         university_college VARCHAR(255)
);


CREATE TABLE Class (
                       class_id          INT PRIMARY KEY,
                       enrollment_code   VARCHAR(100),
                       course_name       VARCHAR(255),
                       semester          VARCHAR(100),
                       teacher_id        INT,
                       course_description TEXT,
                       shard_id          VARCHAR(255),

                       FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
);


CREATE TABLE Course_Material (
                                 id          INT PRIMARY KEY,
                                 class_id    INT NOT NULL,          -- FK back to Class (one‑to‑many)
                                 name        VARCHAR(255),
                                 vector_id   VARCHAR(255) UNIQUE,               -- each vector store object once
                                 is_deleted  BOOLEAN        DEFAULT FALSE,      -- soft‑delete flag, mimics hard delete *unable to do a hard delete without removing PK/FK constraints
                                 deleted_at  TIMESTAMP,                          -- set when is_deleted = TRUE

                                 FOREIGN KEY (class_id) REFERENCES Class(class_id)
                                     ON DELETE CASCADE                          -- drop materials if class is removed
);


CREATE TABLE Enrollment (
                            enrollment_id INT PRIMARY KEY,
                            student_id    INT,
                            class_id      INT,
                            time_created  TIMESTAMP,

                            FOREIGN KEY (student_id) REFERENCES Student(student_id),
                            FOREIGN KEY (class_id)   REFERENCES Class(class_id)
);

CREATE TABLE Chat_Session (
                              session_id  INT PRIMARY KEY,
                              student_id  INT,
                              class_id    INT,
                              start_time  TIMESTAMP,
                              end_time    TIMESTAMP,

                              FOREIGN KEY (student_id) REFERENCES Student(student_id),
                              FOREIGN KEY (class_id)   REFERENCES Class(class_id)
);

CREATE TABLE Chat_Message (
                              message_id  INT PRIMARY KEY,
                              session_id  INT,
                              sender_type VARCHAR(50),
                              content     TEXT,
                              timestamp   TIMESTAMP,

                              FOREIGN KEY (session_id) REFERENCES Chat_Session(session_id)
);


CREATE TABLE Outbox (
                        id            INT PRIMARY KEY,
                        aggregate     VARCHAR(100),      -- e.g. 'Course_Material'
                        aggregate_id  INT,               -- points to Course_Material.id
                        event_type    VARCHAR(50),       -- 'DELETE', 'UPDATE', etc.
                        payload       TEXT,              -- JSON or plain text body
                        created_at    TIMESTAMP,
                        published_at  TIMESTAMP           -- NULL = not yet delivered to outbox table
);