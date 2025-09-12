package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Controller for managing Student entities
@RequestMapping("api/users/students")
@RestController
@AllArgsConstructor
public class StudentController
{

    private final StudentService studentService;

    // Endpoint for Creating a Student
    @PostMapping
    public ResponseEntity<StudentDto> createStudent(@RequestBody StudentDto studentDto)
    {
        StudentDto responseDto = studentService.createStudent(studentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }


    // Endpoint for Retrieving a Student
    @GetMapping("/{student_id}")
    public ResponseEntity<StudentDto> getStudent(@PathVariable Integer student_id)
    {
        StudentDto studentDto = studentService.readStudent(student_id);
        return ResponseEntity.ok().body(studentDto);
    }


    // Endpoint for Updating a Student
    @PutMapping("/{student_id}")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Integer student_id, @RequestBody StudentDto studentDto)
    {
        StudentDto updatedStudentDto = studentService.updateStudent(student_id, studentDto);
        return ResponseEntity.ok().body(updatedStudentDto);
    }


    // Endpoint for Deleting a Student
    @DeleteMapping("/{student_id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Integer student_id)
    {
        studentService.deleteStudent(student_id);
        return ResponseEntity.noContent().build();
    }
}
