package com.askknightro.askknightro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.askknightro.askknightro.entity.Student;

// Interface for data interaction for the Student table in Postgres (gives us access to CRUD functionality)
@Repository
public interface StudentRepository extends JpaRepository<Student, Integer>
{

    boolean existsByEmail(String email);
    boolean existsByCognitoSub(String cognitoSub);
    Optional<Student> findByEmail(String email);
    Student findIdByCognitoSub(String cognitoSub);
}
