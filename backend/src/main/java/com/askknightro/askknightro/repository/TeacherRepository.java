package com.askknightro.askknightro.repository;

import com.askknightro.askknightro.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Interface for data interaction for the Teacher table in Postgres (gives us access to CRUD functionality)
@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Integer>
{
    boolean existsByEmail(String email);
    boolean existsByCognitoSub(String cognitoSub);
}
