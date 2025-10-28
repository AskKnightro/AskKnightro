"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TeacherTopNavbar from "../components/TeacherTopNavbar";
import TeacherNavbar from "../components/TeacherNavbar";
import Footer from "../components/Footer";
import Link from "next/link";
import styles from "./course-logs.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface ChatMessage {
  messageId: number;
  sessionId: number;
  studentId: number;
  classId: number;
  senderType: "STUDENT" | "AI";
  content: string;
  timestamp: string;
}

interface Student {
  studentId: number;
  name: string;
  email: string;
}

interface StudentChatGroup {
  student: Student;
  messageCount: number;
  lastMessageTime: string;
  messages: ChatMessage[];
}

const CourseLogsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [studentChats, setStudentChats] = useState<StudentChatGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const courseParam = searchParams.get("courseId");

    if (!courseParam) {
      setError("Missing course ID");
      return;
    }

    const parsedCourseId = parseInt(courseParam, 10);

    if (isNaN(parsedCourseId)) {
      setError("Invalid course ID");
      return;
    }

    setCourseId(parsedCourseId);
  }, [searchParams]);

  useEffect(() => {
    if (!courseId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load course info
        const courseRes = await fetch(`${API_BASE}/api/users/courses/${courseId}`, {
          headers: getAuthHeaders(),
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.courseName);
        }

        // Load students in course
        const studentsRes = await fetch(`${API_BASE}/api/enrollments/${courseId}`, {
          headers: getAuthHeaders(),
        });
        if (!studentsRes.ok) {
          throw new Error("Failed to load students");
        }

        const students: Student[] = await studentsRes.json();

        // Load messages for each student
        const chatGroups: StudentChatGroup[] = [];

        for (const student of students) {
          const messagesRes = await fetch(
            `${API_BASE}/api/messages/student/${student.studentId}/class/${courseId}`,
            {
              headers: getAuthHeaders(),
            }
          );

          if (messagesRes.ok) {
            const messages: ChatMessage[] = await messagesRes.json();

            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              chatGroups.push({
                student,
                messageCount: messages.length,
                lastMessageTime: lastMessage.timestamp,
                messages,
              });
            }
          }
        }

        // Sort by most recent activity
        chatGroups.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        );

        setStudentChats(chatGroups);
      } catch (err) {
        console.error("Failed to load course logs:", err);
        setError(
          `Failed to load course logs: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatShortDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const toggleStudent = (studentId: number) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  return (
    <>
      <TeacherTopNavbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Course Chat Logs</h1>
            <p className={styles.pageSubtitle}>{courseName}</p>
            {error && <div className={styles.errorMessage}>Error: {error}</div>}
            {loading && (
              <div className={styles.loadingMessage}>Loading chat logs...</div>
            )}
          </div>

          <div className={styles.logsContainer}>
            {studentChats.length === 0 && !loading && !error ? (
              <div className={styles.noLogs}>
                <p>No chat activity found for this course.</p>
              </div>
            ) : (
              <div className={styles.studentList}>
                {studentChats.map((chatGroup) => (
                  <div key={chatGroup.student.studentId} className={styles.studentCard}>
                    <div
                      className={styles.studentHeader}
                      onClick={() => toggleStudent(chatGroup.student.studentId)}
                    >
                      <div className={styles.studentInfo}>
                        <h3 className={styles.studentName}>
                          {chatGroup.student.name}
                        </h3>
                        <p className={styles.studentEmail}>
                          {chatGroup.student.email}
                        </p>
                      </div>
                      <div className={styles.studentStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Messages</span>
                          <span className={styles.statValue}>
                            {chatGroup.messageCount}
                          </span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>Last Active</span>
                          <span className={styles.statValue}>
                            {formatShortDate(chatGroup.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      <button
                        className={styles.expandButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStudent(chatGroup.student.studentId);
                        }}
                      >
                        {expandedStudentId === chatGroup.student.studentId
                          ? "▼"
                          : "▶"}
                      </button>
                    </div>

                    {expandedStudentId === chatGroup.student.studentId && (
                      <div className={styles.messagesSection}>
                        <div className={styles.messagesList}>
                          {chatGroup.messages.map((message) => (
                            <div
                              key={message.messageId}
                              className={`${styles.messageItem} ${
                                message.senderType === "STUDENT"
                                  ? styles.studentMessage
                                  : styles.aiMessage
                              }`}
                            >
                              <div className={styles.messageHeader}>
                                <span className={styles.messageSender}>
                                  {message.senderType === "STUDENT"
                                    ? "Student"
                                    : "Knightro AI"}
                                </span>
                                <span className={styles.messageTime}>
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <div className={styles.messageContent}>
                                {message.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.backLinkContainer}>
            <Link
              href={courseId ? `/teacher-course-dashboard?course=${courseId}` : "/teacher-course-dashboard"}
              className={styles.backLink}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

const CourseLogsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading course logs...
        </div>
      }
    >
      <CourseLogsContent />
    </Suspense>
  );
};

export default CourseLogsPage;

