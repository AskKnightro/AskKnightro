package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.dto.TeacherDto;
import com.askknightro.askknightro.entity.Student;
import com.askknightro.askknightro.entity.Teacher;
import com.askknightro.askknightro.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherService
{

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final IdentityProvisioningService idp;

    // Method for creating a Teacher Entity
    public TeacherDto createTeacher(TeacherDto teacherDto)
    {
        if (teacherRepository.existsByEmail(teacherDto.getEmail())) throw new RuntimeException("Email taken"); // Checking for duplicate emails

        var id = idp.createTeacherIdentity(teacherDto.getEmail(), teacherDto.getName());

        Teacher teacherEntity = Teacher.builder()
                .name(teacherDto.getName())
                .email(teacherDto.getEmail())
                .department(teacherDto.getDepartment())
                .profilePicture(teacherDto.getProfilePicture())
                .bio(teacherDto.getBio())
                .password(teacherDto.getPassword() == null || teacherDto.getPassword().isBlank()
                        ? null
                        : passwordEncoder.encode(teacherDto.getPassword()))
                .cognitoSub(id.sub())
                .cognitoUsername(id.username())
                .build();

        // Saving to Postgres DB
        try {
                teacherRepository.save(teacherEntity);
        } catch (Exception ex) {
                try { idp.disableOrDelete(id.username()); } catch (Exception ignore) {}
                throw ex;
        }

        return TeacherDto.builder()
                .teacherId(teacherEntity.getTeacherId())
                .name(teacherEntity.getName())
                .email(teacherEntity.getEmail())
                .department(teacherEntity.getDepartment())
                .profilePicture(teacherEntity.getProfilePicture())
                .bio(teacherEntity.getBio())
                .build();
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

        String usernameOrSub = (teacher.getCognitoUsername() != null) ? teacher.getCognitoUsername() : teacher.getCognitoSub();
        if (usernameOrSub != null) {
                try { idp.disableOrDelete(usernameOrSub); } catch (Exception e) {
                // decide: log and continue, or rethrow to block deletion
                }
        }

        teacherRepository.delete(teacher);
    }

}
