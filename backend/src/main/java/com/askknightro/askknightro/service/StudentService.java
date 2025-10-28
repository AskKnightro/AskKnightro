package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.entity.Student;
import com.askknightro.askknightro.repository.StudentRepository;
import lombok.RequiredArgsConstructor;

import java.util.Locale;

import org.jline.utils.Log;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService
{

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // Method for creating a Student Entity
    public StudentDto createStudent(StudentDto studentDto)
    {
        if (studentRepository.existsByEmail(studentDto.getEmail())) throw new RuntimeException("Email taken"); // Checking for duplicate emails

        // Building Student Entity from Dto
        Student studentEntity = Student.builder()
                .name(studentDto.getName())
                .email(studentDto.getEmail())
                .password(
                        studentDto.getPassword() == null || studentDto.getPassword().isBlank()
                                ? null
                                : passwordEncoder.encode(studentDto.getPassword()) // encryption
                )
                .profilePicture(studentDto.getProfilePicture())
                .yearStanding(studentDto.getYearStanding())
                .major(studentDto.getMajor())
                .gradDate(studentDto.getGradDate())
                .schoolId(studentDto.getSchoolId())
                .universityCollege(studentDto.getUniversityCollege())
                .cognitoSub(null)
                .cognitoUsername(null)
                .build();

        studentRepository.save(studentEntity);
        
        return StudentDto.builder()
                .studentId(studentEntity.getStudentId())
                .name(studentEntity.getName())
                .email(studentEntity.getEmail())
                .profilePicture(studentEntity.getProfilePicture())
                .yearStanding(studentEntity.getYearStanding())
                .major(studentEntity.getMajor())
                .gradDate(studentEntity.getGradDate())
                .schoolId(studentEntity.getSchoolId())
                .universityCollege(studentEntity.getUniversityCollege())
                .cognitoSub(studentEntity.getCognitoSub())
                .cognitoUsername(studentEntity.getCognitoUsername())
                .build();
    }

    public StudentDto createDraftFromSignup(StudentDto studentDto) {
        String email = studentDto.getEmail().toLowerCase(Locale.ROOT);

        // Idempotent on retries
        var existing = studentRepository.findByEmail(email);
        if (existing.isPresent()) {
            var s = existing.get();
            return StudentDto.builder()
                .studentId(s.getStudentId())
                .name(s.getName())
                .email(s.getEmail())
                .profilePicture(s.getProfilePicture())
                .yearStanding(s.getYearStanding())
                .major(s.getMajor())
                .gradDate(s.getGradDate())
                .schoolId(s.getSchoolId())
                .universityCollege(s.getUniversityCollege())
                .cognitoSub(s.getCognitoSub())
                .cognitoUsername(s.getCognitoUsername())
                .build();
        }

        String hashed = (studentDto.getPassword() == null || studentDto.getPassword().isBlank())
            ? null
            : passwordEncoder.encode(studentDto.getPassword());

        Student studentEntity = Student.builder()
            .name(studentDto.getName())
            .email(email)
            .password(hashed)                // store HASH only
            .profilePicture(studentDto.getProfilePicture())
            .yearStanding(studentDto.getYearStanding())
            .major(studentDto.getMajor())
            .gradDate(studentDto.getGradDate())
            .schoolId(studentDto.getSchoolId())
            .universityCollege(studentDto.getUniversityCollege())
            .cognitoSub(null)                // filled at confirm
            .cognitoUsername(null)           // filled at confirm
            .build();

        studentRepository.save(studentEntity);

        return StudentDto.builder()
            .studentId(studentEntity.getStudentId())
            .name(studentEntity.getName())
            .email(studentEntity.getEmail())
            .profilePicture(studentEntity.getProfilePicture())
            .yearStanding(studentEntity.getYearStanding())
            .major(studentEntity.getMajor())
            .gradDate(studentEntity.getGradDate())
            .schoolId(studentEntity.getSchoolId())
            .universityCollege(studentEntity.getUniversityCollege())
            .cognitoSub(studentEntity.getCognitoSub())
            .cognitoUsername(studentEntity.getCognitoUsername())
            .build();
    }

    /** Called at /confirm-signup to link the existing draft to Cognito IDs. */
    public void attachCognitoIdentityOnConfirm(String email, String sub, String username) {
        var s = studentRepository.findByEmail(email.toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new IllegalStateException("No student draft for " + email));
        s.setCognitoSub(sub);
        s.setCognitoUsername(username);
        studentRepository.save(s);
    }

    // Method for retrieving a Student Entity
    public StudentDto readStudent(Integer id)
    {
        // Retrieve entity from Postgres store
        Student studentEntity = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));


        // Build Dto to be sent back as a response
        return StudentDto.builder()
                .studentId(studentEntity.getStudentId())
                .name(studentEntity.getName())
                .email(studentEntity.getEmail())
                .profilePicture(studentEntity.getProfilePicture())
                .yearStanding(studentEntity.getYearStanding())
                .major(studentEntity.getMajor())
                .gradDate(studentEntity.getGradDate())
                .schoolId(studentEntity.getSchoolId())
                .universityCollege(studentEntity.getUniversityCollege())
                .build();
    }


    // Method for updating a Student Entity
    public StudentDto updateStudent(Integer id, StudentDto requestStudentDto) {
        Student studentEntity = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        if (requestStudentDto.getEmail() != null && !requestStudentDto.getEmail().equals(studentEntity.getEmail())) {
                if (studentRepository.existsByEmail(requestStudentDto.getEmail())) {
                        throw new RuntimeException("Email taken");
                }
                
                studentEntity.setEmail(requestStudentDto.getEmail());
        }


        // Updating only requested non null fields
        if (requestStudentDto.getName() != null) studentEntity.setName(requestStudentDto.getName());
        //if (requestStudentDto.getEmail() != null) studentEntity.setEmail(requestStudentDto.getEmail());
        if (requestStudentDto.getPassword() != null && !requestStudentDto.getPassword().isBlank()) {
            studentEntity.setPassword(passwordEncoder.encode(requestStudentDto.getPassword()));
        }
        if (requestStudentDto.getProfilePicture() != null) studentEntity.setProfilePicture(requestStudentDto.getProfilePicture());
        if (requestStudentDto.getYearStanding() != null) studentEntity.setYearStanding(requestStudentDto.getYearStanding());
        if (requestStudentDto.getMajor() != null) studentEntity.setMajor(requestStudentDto.getMajor());
        if (requestStudentDto.getGradDate() != null) studentEntity.setGradDate(requestStudentDto.getGradDate());
        if (requestStudentDto.getSchoolId() != null) studentEntity.setSchoolId(requestStudentDto.getSchoolId());
        if (requestStudentDto.getUniversityCollege() != null) studentEntity.setUniversityCollege(requestStudentDto.getUniversityCollege());

        Student updatedStudent = studentRepository.save(studentEntity);

        return StudentDto.builder()
                .studentId(updatedStudent.getStudentId())
                .name(updatedStudent.getName())
                .email(updatedStudent.getEmail())
                .profilePicture(updatedStudent.getProfilePicture())
                .yearStanding(updatedStudent.getYearStanding())
                .major(updatedStudent.getMajor())
                .gradDate(updatedStudent.getGradDate())
                .schoolId(updatedStudent.getSchoolId())
                .universityCollege(updatedStudent.getUniversityCollege())
                .build();
    }


    // Method for deleting a Student Entity
    public void deleteStudent(Integer id)
    {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        studentRepository.delete(student);
    }

    public StudentDto ensureStudentFromLogin(String sub, String username, String email, String name) {
        if (studentRepository.existsByCognitoSub(sub)) {
                // already present; optionally return the existing mapped DTO
                // return mapper(existing);
                return null; // if you don't need a return value
        }

        Student student = Student.builder()
                .name(name)
                .email(email)
                .password(null)                // NEVER store Cognito password
                .cognitoSub(sub)
                .cognitoUsername(username)
                .build();

        studentRepository.save(student);

        return StudentDto.builder()
                .studentId(student.getStudentId())
                .name(student.getName())
                .email(student.getEmail())
                .cognitoSub(student.getCognitoSub())
                .cognitoUsername(student.getCognitoUsername())
                .build();
        }

}
