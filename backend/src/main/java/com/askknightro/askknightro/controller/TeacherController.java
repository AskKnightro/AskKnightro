package com.askknightro.askknightro.controller;

import com.askknightro.askknightro.dto.TeacherDto;
import com.askknightro.askknightro.repository.TeacherRepository;
import com.askknightro.askknightro.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

// Controller for managing Teacher entities
@RequestMapping("api/users/teachers")
@RestController
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final TeacherRepository teacherRepository;

    // Endpoint for Creating a Teacher
    // @PostMapping()
    // public ResponseEntity<TeacherDto> createTeacher(@RequestBody TeacherDto teacherDto)
    // {
    //     TeacherDto responseTeacherDto = teacherService.createTeacher(teacherDto);
    //     return ResponseEntity.ok().body(responseTeacherDto);
    // }

    @PostMapping
    public ResponseEntity<TeacherDto> createTeacher(@Valid @RequestBody TeacherDto teacherDto, Authentication auth){
        teacherDto.setTeacherId(null);

        var jwt = (Jwt) auth.getPrincipal();
        teacherDto.setCognitoUsername(auth.getName());
        teacherDto.setCognitoSub(jwt.getClaimAsString("sub"));
        TeacherDto created = teacherService.createTeacher(teacherDto);

        return ResponseEntity
                .created(URI.create("/api/users/teacher/" + created.getTeacherId()))
                .body(created);
    }

    // Endpoint for Retrieving a Teacher
    @GetMapping("/{teacher_id}")
    public ResponseEntity<TeacherDto> getTeacher(@PathVariable Integer teacher_id)
    {
        TeacherDto teacherDto = teacherService.readTeacher(teacher_id);
        return ResponseEntity.ok().body(teacherDto);
    }


    // Endpoint for Updating a Teacher
    @PutMapping("/{teacher_id}")
    public ResponseEntity<TeacherDto> updateTeacher(@PathVariable Integer teacher_id, @RequestBody TeacherDto teacherDto)
    {
        TeacherDto responseTeacherDto = teacherService.updateTeacher(teacher_id, teacherDto);
        return ResponseEntity.ok().body(responseTeacherDto);
    }


    // Endpoint for Deleting a Teacher
    @DeleteMapping("/{teacher_id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Integer teacher_id)
    {
        teacherService.deleteTeacher(teacher_id);
        return ResponseEntity.noContent().build();

    }

}
