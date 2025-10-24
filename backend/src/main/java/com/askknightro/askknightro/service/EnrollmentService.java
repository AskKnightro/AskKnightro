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

    public void addEnrollment(EnrollmentReqDto enrollmentDto) {
        Course courseToEnroll;
        try {
            courseToEnroll = courseManagementRepository.findByEnrollmentCode(enrollmentDto.getEnrollmentCode());
        } catch (Exception e) {
            throw new EntityNotFoundException(
                    "Course with code " + enrollmentDto.getEnrollmentCode() + " not found"
            );
        }

        Student student = studentRepository.findById(enrollmentDto.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Student with id " + enrollmentDto.getStudentId() + " not found"
                ));

//        List<Course> studentCourseList = courseManagementRepository.findAllByStudentId(student.getStudentId());
//        if(studentCourseList.contains(courseToEnroll)) {
//            throw new EntityExistsException("Student already enrolled in course");
//        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .courseClass(courseToEnroll)
                .build();

        student.getEnrollments().add(enrollment);

        enrollmentRepository.save(enrollment);
        studentRepository.save(student);
    }
}