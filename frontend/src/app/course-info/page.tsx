"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./course-info.module.css";

const CourseInfoPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [courseData, setCourseData] = useState({
    courseName: "Introduction to Psychology",
    subject: "Psychology",
    section: "PSY 101 - Section 002",
    description:
      "This course provides an introduction to the scientific study of human behavior and mental processes.",
    credits: "3",
    semester: "Fall 2024",
    meetingTime: "MWF 10:00 AM - 11:00 AM",
    location: "Room 201, Psychology Building",
  });

  // Sample uploaded files - in a real app, this would come from your backend/database
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: "syllabus.txt",
      uploadDate: "2024-10-15",
      size: "2.3 KB",
    },
    {
      id: 2,
      name: "course-outline.txt",
      uploadDate: "2024-10-18",
      size: "4.1 KB",
    },
    {
      id: 3,
      name: "reading-list.txt",
      uploadDate: "2024-10-20",
      size: "1.8 KB",
    },
  ]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to database
    console.log("Saving course data:", courseData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  const handleInputChange = (field: string, value: string) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteFile = (fileId: number) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));
  };

  const handleDownloadFile = (fileName: string) => {
    // In a real app, this would trigger a download from your server
    console.log(`Downloading file: ${fileName}`);
    alert(`Download feature would download: ${fileName}`);
  };
  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Course Information & Settings</h1>
            <p className={styles.pageSubtitle}>
              Manage your course details, settings, and configurations
            </p>
          </div>

          {/* Course Name/Subject Box */}
          <div className={styles.courseNameBox}>
            <div className={styles.courseNameHeader}>
              <h2 className={styles.courseNameTitle}>Course Information</h2>
              <div className={styles.editButtonContainer}>
                {!isEditing ? (
                  <button onClick={handleEdit} className={styles.editButton}>
                    Edit Course
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button onClick={handleSave} className={styles.saveButton}>
                      Save
                    </button>
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

            <div className={styles.courseNameContent}>
              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Course Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.courseName}
                    onChange={(e) =>
                      handleInputChange("courseName", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.courseName}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Subject:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.subject}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Section:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.section}
                    onChange={(e) =>
                      handleInputChange("section", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.section}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Description:</span>
                {isEditing ? (
                  <textarea
                    value={courseData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={styles.editTextarea}
                    rows={3}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.description}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Credits:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.credits}
                    onChange={(e) =>
                      handleInputChange("credits", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.credits}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Semester:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.semester}
                    onChange={(e) =>
                      handleInputChange("semester", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.semester}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Meeting Time:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.meetingTime}
                    onChange={(e) =>
                      handleInputChange("meetingTime", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.meetingTime}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Location:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Files Section */}
          <div className={styles.uploadedFilesBox}>
            <h2 className={styles.sectionTitle}>Uploaded Course Files</h2>
            {uploadedFiles.length > 0 ? (
              <div className={styles.filesList}>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className={styles.fileItem}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{file.name}</div>
                      <div className={styles.fileDetails}>
                        <span className={styles.fileSize}>{file.size}</span>
                        <span className={styles.fileDivider}>•</span>
                        <span className={styles.fileDate}>
                          Uploaded:{" "}
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.fileActions}>
                      <button
                        onClick={() => handleDownloadFile(file.name)}
                        className={styles.downloadButton}
                        title="Download file"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className={styles.deleteButton}
                        title="Delete file"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noFiles}>
                <p>No files uploaded yet.</p>
                <p className={styles.noFilesSubtext}>
                  Files uploaded through the course creation page will appear
                  here.
                </p>
              </div>
            )}
          </div>

          <div className={styles.contentSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Course Settings</h2>
              <p className={styles.placeholder}>
                Course settings and configuration options will appear here...
              </p>
            </div>
          </div>

          <div className={styles.backLinkContainer}>
            <Link href="/teacher-course-dashboard" className={styles.backLink}>
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default CourseInfoPage;
