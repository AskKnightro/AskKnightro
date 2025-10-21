"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./course-enrollment.module.css";

interface Course {
  id: number;
  courseName: string;
  subject: string;
  section: string;
  instructor: string;
  credits: number;
  meetingTime: string;
  description: string;
}

export default function CourseEnrollmentPage() {
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [foundCourse, setFoundCourse] = useState<Course | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Sample courses data - in a real app, this would come from your backend
  const availableCourses: Course[] = [
    {
      id: 1,
      courseName: "Introduction to Psychology",
      subject: "Psychology",
      section: "PSY 101 - Section 002",
      instructor: "Dr. Sarah Johnson",
      credits: 3,
      meetingTime: "MWF 10:00 AM - 11:00 AM",
      description:
        "This course provides an introduction to the scientific study of human behavior and mental processes.",
    },
    {
      id: 2,
      courseName: "Calculus I",
      subject: "Mathematics",
      section: "MATH 151 - Section 001",
      instructor: "Prof. Michael Chen",
      credits: 4,
      meetingTime: "TTh 2:00 PM - 3:30 PM",
      description:
        "Differential and integral calculus of functions of one variable.",
    },
    {
      id: 3,
      courseName: "English Composition",
      subject: "English",
      section: "ENG 101 - Section 003",
      instructor: "Dr. Emily Davis",
      credits: 3,
      meetingTime: "MWF 9:00 AM - 10:00 AM",
      description: "Introduction to academic writing and research methods.",
    },
  ];

  // Sample enrollment codes - in a real app, these would be stored securely in backend
  const enrollmentCodes: { [key: string]: number } = {
    PSY2024: 1,
    MATH151: 2,
    ENG101: 3,
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    // Simulate API call
    setTimeout(() => {
      if (enrollmentCodes[enrollmentCode.toUpperCase()]) {
        const courseId = enrollmentCodes[enrollmentCode.toUpperCase()];
        const course = availableCourses.find((c) => c.id === courseId);

        if (course) {
          setFoundCourse(course);
          setShowConfirmation(true);
          setMessage("");
        }
      } else {
        setMessage("Invalid enrollment code. Please check and try again.");
        setMessageType("error");
        setFoundCourse(null);
        setShowConfirmation(false);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleEnrollConfirm = () => {
    setIsLoading(true);

    // Simulate enrollment API call
    setTimeout(() => {
      setMessage(`Successfully enrolled in ${foundCourse?.courseName}!`);
      setMessageType("success");
      setShowConfirmation(false);
      setFoundCourse(null);
      setEnrollmentCode("");
      setIsLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setFoundCourse(null);
    setMessage("");
    setMessageType("");
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Course Enrollment</h1>
            <p className={styles.pageSubtitle}>
              Enter your course enrollment code to join a class
            </p>
          </div>

          <div className={styles.enrollmentContainer}>
            {!showConfirmation ? (
              <div className={styles.enrollmentForm}>
                <form onSubmit={handleCodeSubmit}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="enrollmentCode" className={styles.label}>
                      Enrollment Code
                    </label>
                    <input
                      type="text"
                      id="enrollmentCode"
                      value={enrollmentCode}
                      onChange={(e) => setEnrollmentCode(e.target.value)}
                      placeholder="Enter your course enrollment code"
                      className={styles.input}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || !enrollmentCode.trim()}
                  >
                    {isLoading ? "Searching..." : "Find Course"}
                  </button>
                </form>

                {message && (
                  <div className={`${styles.message} ${styles[messageType]}`}>
                    {message}
                  </div>
                )}

                <div className={styles.helpSection}>
                  <h3 className={styles.helpTitle}>How to enroll:</h3>
                  <ol className={styles.helpList}>
                    <li>Get your enrollment code from your instructor</li>
                    <li>Enter the code in the field above</li>
                    <li>Review the course details</li>
                    <li>Confirm your enrollment</li>
                  </ol>

                  <div className={styles.sampleCodes}>
                    <p className={styles.sampleTitle}>
                      Sample codes for testing:
                    </p>
                    <div className={styles.codeList}>
                      <span className={styles.sampleCode}>PSY2024</span>
                      <span className={styles.sampleCode}>MATH151</span>
                      <span className={styles.sampleCode}>ENG101</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.confirmationCard}>
                <h2 className={styles.confirmationTitle}>Course Found!</h2>
                <div className={styles.courseDetails}>
                  <div className={styles.courseHeader}>
                    <h3 className={styles.courseName}>
                      {foundCourse?.courseName}
                    </h3>
                    <span className={styles.courseSection}>
                      {foundCourse?.section}
                    </span>
                  </div>

                  <div className={styles.courseInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Subject:</span>
                      <span className={styles.infoValue}>
                        {foundCourse?.subject}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Instructor:</span>
                      <span className={styles.infoValue}>
                        {foundCourse?.instructor}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Credits:</span>
                      <span className={styles.infoValue}>
                        {foundCourse?.credits}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Meeting Time:</span>
                      <span className={styles.infoValue}>
                        {foundCourse?.meetingTime}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Description:</span>
                      <span className={styles.infoValue}>
                        {foundCourse?.description}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.confirmationActions}>
                  <button
                    onClick={handleEnrollConfirm}
                    className={styles.confirmButton}
                    disabled={isLoading}
                  >
                    {isLoading ? "Enrolling..." : "Confirm Enrollment"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className={styles.cancelButton}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
