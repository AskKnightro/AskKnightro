package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.auth.UserRole;
import com.askknightro.askknightro.dto.CourseDto;
import com.askknightro.askknightro.service.CourseManagementService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;


import java.util.List;

// Controller for managing Enrollments in a course
@RequestMapping("api/users/courses")
@RestController
@AllArgsConstructor
public class CourseManagementController
{
    private final CourseManagementService courseManagementService;

    // Method for creating a Course Entity
    @PostMapping
    public ResponseEntity<CourseDto> createCourse(@RequestBody CourseDto courseDto)
    {
        CourseDto created = courseManagementService.createCourse(courseDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Method for reading a Course Entity (Return information about a course)
    @GetMapping("/{course_id}")
    public ResponseEntity<CourseDto> readCourse(@PathVariable("course_id") int course_id)
    {
        return ResponseEntity.ok(courseManagementService.readCourse(course_id));
    }

    // Method for reading multiple Course Entities for a given user & role
    @GetMapping("/user/{user_id}")
    public ResponseEntity<List<CourseDto>> readCourseList(@PathVariable("user_id") int user_id, @RequestParam UserRole role)
    {
        return ResponseEntity.ok(courseManagementService.readCourseList(user_id, role));
    }

    // Method for updating a Course Entity
    @PutMapping("/list/{course_id}")
    public ResponseEntity<CourseDto> updateCourse(@RequestBody CourseDto courseDto, @PathVariable("course_id") int course_id )
    {
        CourseDto updated = courseManagementService.updateCourse(courseDto, course_id);
        return ResponseEntity.ok(updated);
    }

    // CourseManagementController.java
    @DeleteMapping("/{course_id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable("course_id") int courseId) {
        courseManagementService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

}
