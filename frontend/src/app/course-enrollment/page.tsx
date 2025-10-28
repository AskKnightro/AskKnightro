"use client";

import React, { useState, useEffect } from "react";
import StudentNavbar from "../components/StudentNavbar";
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

// helper to narrow unknown error to a readable message
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

function hasMessage(obj: unknown): obj is { message: string } {
  if (typeof obj !== "object" || obj === null) return false;
  const rec = obj as Record<string, unknown>;
  return typeof rec.message === "string";
}

// helper to read a `message` from unknown JSON bodies without using `any`
function readErrorFromResponseBody(v: unknown): string | undefined {
  return hasMessage(v) ? v.message : undefined;
}

export default function CourseEnrollmentPage() {
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [foundCourse, setFoundCourse] = useState<Course | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);

  // Load studentId from storage on client side only
  useEffect(() => {
    const id = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
    if (id) {
      setStudentId(parseInt(id, 10));
    }
  }, []);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  async function enrollStudent(code: string) {
    if (!studentId) {
      throw new Error("Student ID not found. Please log in again.");
    }
    const res = await fetch(`http://localhost:8080/api/enrollments/enroll`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId: studentId, enrollmentCode: code }),
    });
    if (res.status !== 204) {
      let msg = `Enrollment failed (${res.status})`;
      try {
        const data = (await res.json()) as unknown;
        msg = readErrorFromResponseBody(data) ?? msg;
      } catch {
        const txt = await res.text().catch(() => "");
        if (txt) msg = txt;
      }
      throw new Error(msg);
    }
  }

  async function fetchMyCourses(): Promise<Course[]> {
    if (!studentId) {
      throw new Error("Student ID not found. Please log in again.");
    }
    const res = await fetch(
        `http://localhost:8080/api/users/courses/user/${studentId}?role=STUDENT`,
        { 
          headers: getAuthHeaders(),
          cache: "no-store" 
        }
    );
    if (!res.ok) {
      let msg = `Fetching courses failed (${res.status})`;
      try {
        const data = (await res.json()) as unknown;
        msg = readErrorFromResponseBody(data) ?? msg;
      } catch {
        const txt = await res.text().catch(() => "");
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

      // 2) Pull student's courses and locate the just-enrolled course by code
      const courses = await fetchMyCourses();
      const enrolled = courses.find(
          (c) => c.enrollmentCode?.toUpperCase() === code.toUpperCase()
      );

      if (!enrolled) {
        setMessage("Enrolled! Refresh your courses to see the new class.");
        setMessageType("success");
        setIsLoading(false);
        return;
      }

      // 3) Fetch teacher name if teacherId is available
      let instructorName = "TBA";
      if (enrolled.teacherId != null) {
        try {
          const teacherRes = await fetch(
            `http://localhost:8080/api/users/teachers/${enrolled.teacherId}`,
            { headers: getAuthHeaders() }
          );
          if (teacherRes.ok) {
            const teacherData = await teacherRes.json();
            instructorName = teacherData.name || `Teacher #${enrolled.teacherId}`;
          } else {
            instructorName = `Teacher #${enrolled.teacherId}`;
          }
        } catch {
          instructorName = `Teacher #${enrolled.teacherId}`;
        }
      }

      const uiCourse: Course = {
        ...enrolled,
        subject: "Course",
        section: `Class #${enrolled.classId}`,
        instructor: instructorName,
        credits: 3,
        meetingTime: enrolled.semester || "TBA",
        description: enrolled.courseDescription ?? undefined,
      };

      setFoundCourse(uiCourse);
      setShowConfirmation(true);
      setMessage("");
      setMessageType("");
      setEnrollmentCode("");
    } catch (err: unknown) {
      setMessage(getErrorMessage(err) || "Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollConfirm = () => {
    setMessage(`Successfully enrolled in ${foundCourse?.courseName || "the course"}!`);
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
        <StudentNavbar />
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
                        <p className={styles.sampleTitle}>Sample codes for testing:</p>
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
                        <h3 className={styles.courseName}>{foundCourse?.courseName}</h3>
                        <span className={styles.courseSection}>{foundCourse?.section}</span>
                      </div>

                      <div className={styles.courseInfo}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Subject:</span>
                          <span className={styles.infoValue}>{foundCourse?.subject}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Instructor:</span>
                          <span className={styles.infoValue}>{foundCourse?.instructor}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Credits:</span>
                          <span className={styles.infoValue}>{foundCourse?.credits}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Meeting Time:</span>
                          <span className={styles.infoValue}>{foundCourse?.meetingTime}</span>
                        </div>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Description:</span>
                          <span className={styles.infoValue}>{foundCourse?.description}</span>
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