package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.EnrollmentDto;
import com.askknightro.askknightro.dto.EnrollmentReqDto;
import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.entity.Course;
import com.askknightro.askknightro.entity.Enrollment;
import com.askknightro.askknightro.entity.Student;
import com.askknightro.askknightro.repository.CourseManagementRepository;
import com.askknightro.askknightro.repository.EnrollmentRepository;
import com.askknightro.askknightro.repository.StudentRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

 // Service method for Student Management/Enrollments
@Service
@RequiredArgsConstructor
public class EnrollmentService
{

    private final EnrollmentRepository enrollmentRepository;
    private final CourseManagementRepository courseManagementRepository;
    private final StudentService studentService;
    private final StudentRepository studentRepository;

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

    @Transactional
    public void addEnrollment(EnrollmentReqDto enrollmentDto) {
        // 1) Course by code (404 if not found)
        Course courseToEnroll = courseManagementRepository
                .findOptionalByEnrollmentCode(enrollmentDto.getEnrollmentCode())
                .orElseThrow(() -> new EntityNotFoundException(
                        "No course found for enrollment code '" + enrollmentDto.getEnrollmentCode() + "'."));

        // 2) Student exists (404 if not found)
        Student student = studentRepository.findById(enrollmentDto.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Student with id " + enrollmentDto.getStudentId() + " not found."));

        // 3) Already enrolled? (409)
        boolean already = enrollmentRepository.existsByClassIdAndStudentIdNative(
                courseToEnroll.getClassId(), student.getStudentId());

        if (already) {
            throw new EntityExistsException("You are already enrolled in this course.");
        }

        // 4) Save
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .courseClass(courseToEnroll)
                .build();

        enrollmentRepository.save(enrollment);
    }
}