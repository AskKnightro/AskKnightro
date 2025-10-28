package com.askknightro.askknightro.repository;

import com.askknightro.askknightro.entity.Enrollment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    // List all enrollments by class_id
    @Query(value = "SELECT * FROM enrollment e WHERE e.class_id = :classId", nativeQuery = true)
    List<Enrollment> findAllByClassIdNative(@Param("classId") Integer classId);

    // Existence check by (class_id, student_id)
    @Query(value = "SELECT EXISTS (SELECT 1 FROM enrollment e WHERE e.class_id = :classId AND e.student_id = :studentId)", nativeQuery = true)
    boolean existsByClassIdAndStudentIdNative(@Param("classId") Integer classId,
                                              @Param("studentId") Integer studentId);

    // Get single enrollment by (class_id, student_id)
    @Query(value = "SELECT * FROM enrollment e WHERE e.class_id = :classId AND e.student_id = :studentId LIMIT 1", nativeQuery = true)
    Optional<Enrollment> findByClassIdAndStudentIdNative(@Param("classId") Integer classId,
                                                         @Param("studentId") Integer studentId);

    // Delete by (class_id, student_id)
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM enrollment WHERE class_id = :classId AND student_id = :studentId", nativeQuery = true)
    int deleteByClassIdAndStudentIdNative(@Param("classId") Integer classId,
                                          @Param("studentId") Integer studentId);

    // Hard delete all enrollments for a class
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM enrollment WHERE class_id = :classId", nativeQuery = true)
    int deleteByClassId(@Param("classId") Integer classId);
}