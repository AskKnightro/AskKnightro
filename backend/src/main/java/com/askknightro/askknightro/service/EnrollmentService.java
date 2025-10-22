package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.entity.Enrollment;
import com.askknightro.askknightro.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// Service method for Student Management/Enrollments
@Service
@RequiredArgsConstructor
public class EnrollmentService
{

    private final EnrollmentRepository enrollmentRepository;
    private final StudentService studentService;

    // Service method for retrieving a list of Students of a given Course
    public List<StudentDto> readStudentList(int course_id)
    {
        // Retrieve a list of enrollment rows by class_id
        List<Enrollment> enrollments = enrollmentRepository.findAllByClassIdNative(course_id);

        // Map each enrollment's student_id -> StudentDto using StudentService
        return enrollments.stream()
                .map(e -> {
                    Integer studentId = e.getStudent().getStudentId(); // If relations: e.getStudent().getStudentId()
                    return studentService.readStudent(studentId);
                })
                .collect(Collectors.toList());
    }

    // Service method for retrieving a singular Student from a given Course
    public StudentDto readStudent(int course_id, int student_id)
    {
        boolean exists = enrollmentRepository.existsByClassIdAndStudentIdNative(course_id, student_id);
        if (!exists) {
            throw new RuntimeException(
                    "Enrollment not found for course_id=" + course_id + " and student_id=" + student_id
            );
        }

        // Return the Student as DTO
        return studentService.readStudent(student_id);
    }

    // Service method for deleting a Student from a given course
    public void deleteStudent(int course_id, int student_id)
    {
        // Find the specific enrollment row
        Enrollment enrollment = enrollmentRepository.findByClassIdAndStudentIdNative(course_id, student_id)
                .orElseThrow(() -> new RuntimeException(
                        "Enrollment not found for course_id=" + course_id + " and student_id=" + student_id
                ));

        // Delete that enrollment row
        enrollmentRepository.delete(enrollment);
    }
}