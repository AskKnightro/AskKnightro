"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import styles from "./student-profile.module.css";

interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  major: string;
  year: string;
  gpa: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface EnrolledCourse {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  grade: string;
  semester: string;
}

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@ucf.edu",
    studentId: "12345678",
    major: "Computer Science",
    year: "Junior",
    gpa: "3.75",
    phone: "(407) 555-0123",
    address: "123 Knight Circle, Orlando, FL 32816",
    emergencyContact: "Jane Smith (Mother)",
    emergencyPhone: "(407) 555-0456",
  });

  const [enrolledCourses] = useState<EnrolledCourse[]>([
    {
      id: "cs101",
      code: "CS101",
      name: "Intro to Computer Science",
      instructor: "Dr. Anderson",
      credits: 3,
      grade: "A-",
      semester: "Fall 2024",
    },
    {
      id: "db101",
      code: "DB101",
      name: "Database Systems",
      instructor: "Prof. Wilson",
      credits: 3,
      grade: "B+",
      semester: "Fall 2024",
    },
    {
      id: "cs102",
      code: "CS102",
      name: "Deeper into Computer Science",
      instructor: "Dr. Martinez",
      credits: 4,
      grade: "A",
      semester: "Fall 2024",
    },
  ]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to database
    console.log("Saving student info:", studentInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset changes if needed
  };

  const handleInputChange = (field: keyof StudentInfo, value: string) => {
    setStudentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* Single Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.studentName}>
                {studentInfo.firstName} {studentInfo.lastName}
              </h1>
              <div className={styles.editButtonContainer}>
                {!isEditing ? (
                  <Button label="Edit Profile" onClick={handleEdit} />
                ) : (
                  <div className={styles.editActions}>
                    <Button label="Save" onClick={handleSave} />
                    <button
                      onClick={handleCancel}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={studentInfo.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {studentInfo.firstName}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={studentInfo.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {studentInfo.lastName}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Student ID</label>
                <span className={styles.fieldValue}>
                  {studentInfo.studentId}
                </span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={studentInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>{studentInfo.email}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={studentInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>{studentInfo.phone}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Major</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={studentInfo.major}
                    onChange={(e) => handleInputChange("major", e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>{studentInfo.major}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Year</label>
                {isEditing ? (
                  <select
                    value={studentInfo.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className={styles.editSelect}
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                ) : (
                  <span className={styles.fieldValue}>{studentInfo.year}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>GPA</label>
                <span className={styles.fieldValue}>{studentInfo.gpa}</span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={studentInfo.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {studentInfo.address}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={studentInfo.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {studentInfo.emergencyContact}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Emergency Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={studentInfo.emergencyPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyPhone", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {studentInfo.emergencyPhone}
                  </span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Enrolled Courses</label>
                <div className={styles.coursesList}>
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className={styles.courseItem}>
                      <span className={styles.courseCode}>{course.code}</span> -{" "}
                      {course.name} ({course.grade})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
