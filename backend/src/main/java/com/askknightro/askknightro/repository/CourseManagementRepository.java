package com.askknightro.askknightro.repository;

import com.askknightro.askknightro.entity.Course;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseManagementRepository extends JpaRepository<Course, Integer> {

    // Classes a student is enrolled in
    @Query(value = """
        SELECT c.* 
        FROM class c
        JOIN enrollment e ON e.class_id = c.class_id
        WHERE e.student_id = :studentId
        ORDER BY c.class_id
        """, nativeQuery = true)
    List<Course> findAllByStudentId(@Param("studentId") Integer studentId);

    // Classes taught by a teacher
    @Query(value = """
        SELECT c.*
        FROM class c
        WHERE c.teacher_id = :teacherId
        ORDER BY c.class_id
        """, nativeQuery = true)
    List<Course> findAllByTeacherId(@Param("teacherId") Integer teacherId);

    Course findByEnrollmentCode(String enrollmentCode);

    // Find course by enrollment code
    @Query(value = "SELECT * FROM class c WHERE c.enrollment_code = :code LIMIT 1", nativeQuery = true)
    Optional<Course> findOptionalByEnrollmentCode(@Param("code") String code);

}
