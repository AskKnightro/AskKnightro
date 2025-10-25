"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./course-enrollment.module.css";

interface Course {
  classId: number;
  courseName: string;
  semester: string;
  teacherId: number | null;
  enrollmentCode: string;
  courseDescription: string;
  shardId: string;
  // Local-only fields below for your UI (not from backend)
  subject?: string;
  section?: string;
  instructor?: string;
  credits?: number;
  meetingTime?: string;
  description?: string;
}


// hardcode a student for now
const STUDENT_ID = 1;

export default function CourseEnrollmentPage() {
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [foundCourse, setFoundCourse] = useState<Course | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function enrollStudent(code: string) {
    const res = await fetch(`http://localhost:8080/api/enrollments/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: STUDENT_ID, enrollmentCode: code }),
    });
    // Your controller returns 204 No Content on success
    if (res.status !== 204) {
      let msg = `Enrollment failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        const txt = await res.text();
        if (txt) msg = txt;
      }
      throw new Error(msg);
    }
  }

  async function fetchMyCourses(): Promise<Course[]> {
    const res = await fetch(
        `http://localhost:8080/api/users/courses/user/${STUDENT_ID}?role=STUDENT`,
        { cache: "no-store" }
    );
    if (!res.ok) {
      let msg = `Fetching courses failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        const txt = await res.text();
        if (txt) msg = txt;
      }
      throw new Error(msg);
    }
    const list = (await res.json()) as Course[];
    return list;
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");
    setFoundCourse(null);
    setShowConfirmation(false);

    const code = enrollmentCode.trim();
    if (!code) {
      setIsLoading(false);
      return;
    }

    try {
      // 1) Enroll the student
      await enrollStudent(code);

      // 2) Pull student’s courses and locate the just-enrolled course by code
      const courses = await fetchMyCourses();
      const enrolled = courses.find(
          (c) => c.enrollmentCode?.toUpperCase() === code.toUpperCase()
      );

      if (!enrolled) {
        // Enrollment succeeded but we couldn’t match a course by code (fallback UX)
        setMessage("Enrolled! Refresh your courses to see the new class.");
        setMessageType("success");
        setIsLoading(false);
        return;
      }

      // map backend fields to your UI fields for the confirmation card
      const uiCourse: Course = {
        ...enrolled,
        id: enrolled.classId,
        subject: "Course", // you can adjust/derive if you later add subject
        section: `Class #${enrolled.classId}`,
        instructor:
            enrolled.teacherId != null ? `Teacher #${enrolled.teacherId}` : "TBA",
        credits: 3, // placeholder since backend doesn't send this
        meetingTime: enrolled.semester || "TBA",
        description: enrolled.courseDescription,
      } as any;

      setFoundCourse(uiCourse);
      setShowConfirmation(true);
      setMessage("");
      setMessageType("");
      setEnrollmentCode("");
    } catch (err: any) {
      setMessage(err?.message || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollConfirm = () => {
    // Already enrolled on the backend; this just closes the card
    setMessage(
        `Successfully enrolled in ${foundCourse?.courseName || "the course"}!`
    );
    setMessageType("success");
    setShowConfirmation(false);
    setFoundCourse(null);
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
                        {isLoading ? "Enrolling..." : "Enroll"}
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
                          <span className={styles.sampleCode}>ENR-3042</span>
                          <span className={styles.sampleCode}>ENR-7257</span>
                          <span className={styles.sampleCode}>ENR-4590</span>
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
                        Confirm
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