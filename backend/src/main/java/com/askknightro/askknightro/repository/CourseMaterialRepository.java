package com.askknightro.askknightro.repository;

import com.askknightro.askknightro.entity.Course;
import com.askknightro.askknightro.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Integer> {

    // List materials for a class (only active)
    List<CourseMaterial> findByCourseClass_ClassIdAndIsDeletedFalse(Integer classId);

    // Single active material
    Optional<CourseMaterial> findByIdAndIsDeletedFalse(Integer id);

    // Soft delete (mark + timestamp)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CourseMaterial m set m.isDeleted = true, m.deletedAt = CURRENT_TIMESTAMP " +
            "where m.id = :id and m.isDeleted = false")
    int softDeleteById(@Param("id") Integer id);

    // Rename while active
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update CourseMaterial m set m.name = :name where m.id = :id and m.isDeleted = false")
    int updateName(@Param("id") Integer id, @Param("name") String name);

    // Helper to fetch ids for vector-store cleanup
    @Query("select m.id from CourseMaterial m " +
            "where m.courseClass.classId = :classId and m.isDeleted = false")
    List<Integer> findActiveIdsByClassId(@Param("classId") Integer classId);

    // Guard: ensure a material belongs to a class and is active
    boolean existsByIdAndCourseClass_ClassIdAndIsDeletedFalse(Integer id, Integer classId);

    // Soft delete all for a class
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update CourseMaterial m
           set m.isDeleted = true, m.deletedAt = CURRENT_TIMESTAMP
         where m.courseClass.classId = :classId and m.isDeleted = false
        """)
    int softDeleteByClassId(@Param("classId") Integer classId);

    // Hard delete all rows for a class (returns count)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from CourseMaterial m where m.courseClass.classId = :classId")
    int hardDeleteByClassId(@Param("classId") Integer classId);

}