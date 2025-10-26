package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.TeacherDto;
import com.askknightro.askknightro.entity.Teacher;
import com.askknightro.askknightro.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherService
{

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    // Method for creating a Teacher Entity
    public TeacherDto createTeacher(TeacherDto teacherDto)
    {
        if (teacherRepository.existsByEmail(teacherDto.getEmail())) throw new RuntimeException("Email taken"); // Checking for duplicate emails

        Teacher teacherEntity = Teacher.builder()
                .name(teacherDto.getName())
                .email(teacherDto.getEmail())
                .department(teacherDto.getDepartment())
                .profilePicture(teacherDto.getProfilePicture())
                .bio(teacherDto.getBio())
                .password(teacherDto.getPassword() == null || teacherDto.getPassword().isBlank()
                        ? null
                        : passwordEncoder.encode(teacherDto.getPassword()))
                .build();

        // Saving to Postgres 
        teacherRepository.save(teacherEntity);
        
        return TeacherDto.builder()
                .teacherId(teacherEntity.getTeacherId())
                .name(teacherEntity.getName())
                .email(teacherEntity.getEmail())
                .department(teacherEntity.getDepartment())
                .profilePicture(teacherEntity.getProfilePicture())
                .bio(teacherEntity.getBio())
                .build();
    }

    public TeacherDto createDraftFromSignup(TeacherDto teacherDto){
        String email = teacherDto.getEmail().toLowerCase(Locale.ROOT);

        var existing = teacherRepository.findByEmail(email);
        if (existing.isPresent()) {
            var s = existing.get();
            return TeacherDto.builder()
                    .teacherId(s.getTeacherId())
                    .name(s.getName())
                    .email(s.getEmail())
                    .department(s.getDepartment())
                    .profilePicture(s.getProfilePicture())
                    .bio(s.getBio())
                    .build();
        }

        String hashed = (teacherDto.getPassword() == null || teacherDto.getPassword().isBlank())
                ? null
                : passwordEncoder.encode(teacherDto.getPassword());

        Teacher teacherEntity = Teacher.builder()
                .name(teacherDto.getName())
                .email(email)
                .password(hashed)
                .department(teacherDto.getDepartment())
                .profilePicture(teacherDto.getProfilePicture())
                .build();

        teacherRepository.save(teacherEntity);
        
        return TeacherDto.builder()
                .teacherId(teacherEntity.getTeacherId())
                .name(teacherEntity.getName())
                .email(teacherEntity.getEmail())
                .department(teacherEntity.getDepartment())
                .profilePicture(teacherEntity.getProfilePicture())
                .bio(teacherEntity.getBio())
                .build();
    }

    public void attachCognitoIdentityOnConfirm(String email, String sub, String cognitoUsername) {
        Teacher teacher = teacherRepository.findByEmail(email.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + email));

        teacher.setCognitoSub(sub);
        teacher.setCognitoUsername(cognitoUsername);

        teacherRepository.save(teacher);
    }

    // Method for retrieving a Teacher Entity
    public TeacherDto readTeacher(Integer id)
    {
        // Retrieving entity from Postgres DB
        Teacher teacherEntity = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        return TeacherDto.builder()
                .teacherId(teacherEntity.getTeacherId())
                .name(teacherEntity.getName())
                .email(teacherEntity.getEmail())
                .department(teacherEntity.getDepartment())
                .profilePicture(teacherEntity.getProfilePicture())
                .bio(teacherEntity.getBio())
                .build();
    }


    // Method for updating a Student Entity
    public TeacherDto updateTeacher(Integer id, TeacherDto teacherDto)
    {
        Teacher teacherEntity = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + id));

        if (teacherDto.getName() != null) teacherEntity.setName(teacherDto.getName());
        if (teacherDto.getEmail() != null) teacherEntity.setEmail(teacherDto.getEmail());
        if (teacherDto.getDepartment() != null) teacherEntity.setDepartment(teacherDto.getDepartment());
        if (teacherDto.getProfilePicture() != null) teacherEntity.setProfilePicture(teacherDto.getProfilePicture());
        if (teacherDto.getBio() != null) teacherEntity.setBio(teacherDto.getBio());
        if (teacherDto.getPassword() != null && !teacherDto.getPassword().isBlank()) {
            teacherDto.setPassword(passwordEncoder.encode(teacherDto.getPassword()));
        }

        Teacher updatedTeacher = teacherRepository.save(teacherEntity);
        return TeacherDto.builder()
                .teacherId(updatedTeacher.getTeacherId())
                .name(updatedTeacher.getName())
                .email(updatedTeacher.getEmail())
                .department(updatedTeacher.getDepartment())
                .profilePicture(updatedTeacher.getProfilePicture())
                .bio(updatedTeacher.getBio())
                .build();


    }


    // Method for deleting a Teacher Entity
    public void deleteTeacher(Integer id)
    {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        teacherRepository.delete(teacher);
    }

    public TeacherDto ensureTeacherFromLogin(String sub, String username, String email, String name) {
        if (teacherRepository.existsByCognitoSub(sub)) {
                return null;
        }

        Teacher teacher = Teacher.builder()
                .name(name)
                .email(email)
                .password(null)
                .cognitoSub(sub)
                .cognitoUsername(username)
                .build();

        teacherRepository.save(teacher);

        return TeacherDto.builder()
                .teacherId(teacher.getTeacherId())
                .name(teacher.getName())
                .email(teacher.getEmail())
                .cognitoSub(teacher.getCognitoSub())
                .cognitoUsername(teacher.getCognitoUsername())
                .build();
        }

}
