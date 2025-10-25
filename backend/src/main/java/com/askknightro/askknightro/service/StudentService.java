package com.askknightro.askknightro.service;

import com.askknightro.askknightro.dto.StudentDto;
import com.askknightro.askknightro.entity.Student;
import com.askknightro.askknightro.repository.StudentRepository;
import lombok.RequiredArgsConstructor;

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
    private final IdentityProvisioningService idp;

    // Method for creating a Student Entity
    public StudentDto createStudent(StudentDto studentDto)
    {
        if (studentRepository.existsByEmail(studentDto.getEmail())) throw new RuntimeException("Email taken"); // Checking for duplicate emails

        var id = idp.createStudentIdentity(studentDto.getEmail(), studentDto.getName());

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
                .cognitoSub(id.sub())
                .cognitoUsername(id.username())
                .build();

        // studentRepository.save(studentEntity);

        try {
                studentRepository.save(studentEntity);
        } catch (Exception ex) {
                try { idp.disableOrDelete(id.username()); } catch (Exception ignore) {}
                throw ex;
        }

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
                .cognitoSub(id.sub())
                .cognitoUsername(id.username())
                .build();
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
                // update Cognito first; if it throws, DB won't be changed due to @Transactional
                String usernameOrSub = (studentEntity.getCognitoUsername() != null) ? studentEntity.getCognitoUsername() : studentEntity.getCognitoSub();
                if (usernameOrSub != null) {
                        idp.updateEmail(usernameOrSub, requestStudentDto.getEmail());
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

        String usernameOrSub = (student.getCognitoUsername() != null) ? student.getCognitoUsername() : student.getCognitoSub();
        if (usernameOrSub != null) {
                try { idp.disableOrDelete(usernameOrSub); } catch (Exception e) {
                // decide: log and continue, or rethrow to block deletion
                }
        }

        studentRepository.delete(student);
    }



}
