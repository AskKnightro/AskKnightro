"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import styles from "./student-course-listing.module.css";

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

function mapDtoToCourse(dto: CourseDto): Course {
  return {
    id: String(dto.classId),
    courseName: dto.courseName,
    subject: "—",
    section: dto.semester ?? "—",
    instructor: dto.teacherId != null ? `Teacher #${dto.teacherId}` : "TBA",
    credits: 3,
    meetingTime: "See syllabus",
    description: dto.courseDescription ?? "No description provided.",
  };
}

/** Top-level page just provides Suspense */
export default function StudentCourseListingPage() {
  return (
      <>
        <Navbar />
        <Suspense fallback={<main className={styles.mainContent}><p>Loading…</p></main>}>
          <StudentCourseListingContent />
        </Suspense>
        <Footer />
      </>
  );
}

/** Inner component is where we call useSearchParams */
function StudentCourseListingContent() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const params = useSearchParams();
  const studentId = useMemo(() => {
    const fromQuery = params?.get("studentId");
    return fromQuery ? parseInt(fromQuery, 10) : 1;
  }, [params]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setErrorMsg("");
        const url = `http://localhost:8080/api/users/courses/user/${studentId}?role=STUDENT`;
        const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
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

  const handleCourseClick = (courseId: string) => router.push(`/course-chat?course=${courseId}`);
  const handleJoinCourse = () => router.push("/course-enrollment");

  return (
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeMessage}>Hello, John</h1>
            <p className={styles.subtitle}>
              Choose a class below to get personalized help from your AI Teaching Assistant.
            </p>
          </div>

          <div className={styles.coursesSection}>
            <h2 className={styles.sectionTitle}>Your Courses</h2>

            {loading && <p>Loading courses…</p>}
            {!loading && errorMsg && <p style={{ color: "crimson", fontWeight: 600 }}>{errorMsg}</p>}
            {!loading && !errorMsg && courses.length === 0 && <p>No courses yet. Try joining one!</p>}

            <div className={styles.courseGrid}>
              {courses.map((course) => (
                  <CourseCard
                      key={course.id}
                      courseTitle={course.courseName}
                      nextExam={"—"}
                      reviewTopic={course.section}
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