package com.askknightro.askknightro.service;

import com.askknightro.askknightro.auth.UserRole;
import com.askknightro.askknightro.dto.CourseDto;
import com.askknightro.askknightro.entity.Course;
import com.askknightro.askknightro.entity.Teacher;
import com.askknightro.askknightro.repository.CourseManagementRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class CourseManagementService
{
    private final CourseManagementRepository courseManagementRepository;

    @PersistenceContext
    private EntityManager em;

    private static final Random RAND = new SecureRandom();

    // Service method for adding a course
    @Transactional
    public CourseDto createCourse(CourseDto courseDto) {

        // Build entity from DTO (Teacher is a relation; set by reference)
        Course entity = new Course();

        entity.setCourseName(courseDto.getCourseName());
        entity.setSemester(courseDto.getSemester());
        entity.setCourseDescription(courseDto.getCourseDescription());
        entity.setShardId(courseDto.getShardId());

        // Generate a randomized enrollment code if missing
        String code = courseDto.getEnrollmentCode();
        if (code == null || code.isBlank()) {
            code = generateEnrollmentCode();
        }
        entity.setEnrollmentCode(code);

        // Attach teacher by ID if provided
        if (courseDto.getTeacherId() != null) {
            Teacher ref = em.getReference(Teacher.class, courseDto.getTeacherId());
            entity.setTeacher(ref);
        } else {
            entity.setTeacher(null);
        }

        Course saved = courseManagementRepository.save(entity);
        return toDto(saved);
    }

    // Service method for reading a course
    public CourseDto readCourse(int course_id) {
        Course c = courseManagementRepository.findById(course_id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + course_id));
        return toDto(c);
    }

    // Service method for reading a list of courses
    public List<CourseDto> readCourseList(int user_id, UserRole role) {
        List<Course> classes = switch (role) {
            case STUDENT -> courseManagementRepository.findAllByStudentId(user_id);
            case TEACHER -> courseManagementRepository.findAllByTeacherId(user_id);
        };
        return classes.stream().map(this::toDto).toList();
    }

    // Service method for updating a course
    @Transactional
    public CourseDto updateCourse(CourseDto courseDto, int course_id) {
        Course entity = courseManagementRepository.findById(course_id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + course_id));

        if (courseDto.getCourseName() != null) entity.setCourseName(courseDto.getCourseName());
        if (courseDto.getSemester() != null) entity.setSemester(courseDto.getSemester());
        if (courseDto.getCourseDescription() != null) entity.setCourseDescription(courseDto.getCourseDescription());
        if (courseDto.getShardId() != null) entity.setShardId(courseDto.getShardId());

        if (courseDto.getEnrollmentCode() != null && !courseDto.getEnrollmentCode().isBlank()) {
            entity.setEnrollmentCode(courseDto.getEnrollmentCode());
        }

        if (courseDto.getTeacherId() != null) {
            Teacher ref = em.getReference(Teacher.class, courseDto.getTeacherId());
            entity.setTeacher(ref);
        }

        Course updated = courseManagementRepository.save(entity);
        return toDto(updated);
    }


    // Service method for deleting a course

    // Helper methods

    private CourseDto toDto(Course c)
    {
        Integer teacherId = (c.getTeacher() != null ? c.getTeacher().getTeacherId() : null);
        return CourseDto.builder()
                .classId(c.getClassId())
                .enrollmentCode(c.getEnrollmentCode())
                .courseName(c.getCourseName())
                .semester(c.getSemester())
                .teacherId(teacherId)
                .courseDescription(c.getCourseDescription())
                .shardId(c.getShardId())
                .build();
    }

    private String generateEnrollmentCode() {
        // ENR-XXXX (numeric) or ENR-AB12C (alnum). Here: numeric 4 digits.
        int num = RAND.nextInt(10_000); // 0..9999
        return String.format(Locale.US, "ENR-%04d", num);
    }
}
