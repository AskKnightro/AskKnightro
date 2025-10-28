"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentNavbar from "../components/StudentNavbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import styles from "./student-dashboard.module.css";

interface Course {
  id: string;
  courseName: string;
  subject: string;
  section: string;
  instructor: string;
  credits: number;
  meetingTime: string;
  description: string;
}

interface CourseDto {
  classId: number;
  enrollmentCode: string;
  courseName: string;
  semester: string;
  teacherId: number | null;
  courseDescription: string | null;
  shardId: string | null;
}

interface StudentDto {
  studentId: number;
  name: string;
  email: string;
  major?: string | null;
  yearStanding?: string | null;
  profilePicture?: string | null;
}

function mapDtoToCourse(dto: CourseDto): Course {
  return {
    id: String(dto.classId),
    courseName: dto.courseName,
    subject: "—",
    section: dto.semester ?? "—",
    instructor: dto.teacherId != null ? `You (Teacher #${dto.teacherId})` : "You",
    credits: 3,
    meetingTime: "See syllabus",
    description: dto.courseDescription || "No description provided.",  // ⬅️ handles "", "   "
  };
}

/** Top-level wrapper with suspense fallback */
export default function StudentDashboardPage() {
  return (
      <>
        <StudentNavbar />
        <Suspense
            fallback={
              <main className={styles.mainContent}>
                <p>Loading…</p>
              </main>
            }
        >
          <StudentDashboardContent />
        </Suspense>
        <Footer />
      </>
  );
}

/** Inner component */
function StudentDashboardContent() {
  const router = useRouter();

  const [studentId, setStudentId] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Load studentId from storage on client side only
  useEffect(() => {
    const id = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
    setStudentId(id);
  }, []);

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /** Fetch student info */
  useEffect(() => {
    if (!studentId) return;
    
    async function fetchStudent() {
      try {
        const res = await fetch(`http://localhost:8080/api/users/students/${studentId}`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch student (${res.status})`);
        const data: StudentDto = await res.json();
        setStudent(data);
      } catch (err: unknown) {
        console.error(err);
        setStudent(null);
      }
    }
    fetchStudent();
  }, [studentId]);

  /** Fetch courses */
  useEffect(() => {
    if (!studentId) return;
    
    async function fetchCourses() {
      try {
        setLoading(true);
        setErrorMsg("");
        const url = `http://localhost:8080/api/users/courses/user/${studentId}?role=STUDENT`;
        const res = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch courses (${res.status}): ${text || res.statusText}`);
        }
        const data: CourseDto[] = await res.json();
        setCourses(data.map(mapDtoToCourse));
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Unable to load courses.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [studentId]);

  const handleCourseClick = (courseId: string) =>
      router.push(`/course-chat?course=${courseId}`);

  const handleJoinCourse = () => router.push(`/course-enrollment`);

  const studentName = student?.name ?? "Student";

  return (
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeMessage}>Hello, {studentName}</h1>
            <p className={styles.subtitle}>
              Choose a class below to get personalized help from your AI Teaching Assistant.
              Each assistant is trained on materials specific to that class, so you&apos;ll get accurate
              and targeted support.
            </p>
          </div>

          <div className={styles.coursesSection}>
            <h2 className={styles.sectionTitle}>Your Courses</h2>

            {loading && <p style={{ color: "#000" }}>Loading courses…</p>}
            {!loading && errorMsg && (
                <p style={{ color: "crimson", fontWeight: 600 }}>{errorMsg}</p>
            )}
            {!loading && !errorMsg && courses.length === 0 && (
                <p style={{ color: "#000" }}>No courses yet. Try joining one!</p>
            )}

            <div className={styles.courseGrid}>
              {courses.map((course) => (
                  <CourseCard
                      key={course.id}
                      courseTitle={course.courseName}
                      nextExam={"—"}
                      reviewTopic={course.section}
                      description={course.description}
                      onClick={() => handleCourseClick(course.id)}
                  />
              ))}
            </div>
          </div>

          <div className={styles.joinSection}>
            <Button label="Join a Course" onClick={handleJoinCourse} />
          </div>
        </main>
      </div>
  );
}

