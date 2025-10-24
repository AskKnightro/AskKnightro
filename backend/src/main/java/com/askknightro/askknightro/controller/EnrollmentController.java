package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.EnrollmentReqDto;
import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.service.EnrollmentService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller for managing Enrollments in a course
@RequestMapping("api/enrollments")
@RestController
@AllArgsConstructor
public class EnrollmentController
{

    private final EnrollmentService enrollmentService;

    // Endpoint for fetching all students of a given course
    @GetMapping("/{course_id}")
    public ResponseEntity<List<StudentDto>> readStudentList(@PathVariable int course_id)
    {
        List<StudentDto> studentDtoList = enrollmentService.readStudentList(course_id);
        return ResponseEntity.ok(studentDtoList);
    }

    // Endpoint for fetching single student of a given course
    @GetMapping("/{user_id}")
    public ResponseEntity<StudentDto> readStudent(@PathVariable int course_id, @PathVariable int student_id)
    {
        StudentDto dto = enrollmentService.readStudent(course_id, student_id);
        return ResponseEntity.ok(dto);
    }

    // Endpoint for deleting a student from a given course
    @DeleteMapping("/{course_id}/students/{student_id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable int course_id, @PathVariable int student_id)
    {
        enrollmentService.deleteStudent(course_id, student_id);
        return ResponseEntity.noContent().build();
    }

    //Endpoint for adding a student to a course
    @PostMapping("/enroll")
    public ResponseEntity<Void> addStudent(@RequestBody EnrollmentReqDto reqDto)
    {
        enrollmentService.addEnrollment(reqDto);
        return ResponseEntity.noContent().build();
    }
}