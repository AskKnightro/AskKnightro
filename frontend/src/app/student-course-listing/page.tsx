"use client";

import React, { useEffect, useMemo, useState } from "react";
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

// Backend DTO (from your Spring API)
interface CourseDto {
  classId: number;
  enrollmentCode: string;
  courseName: string;
  semester: string;
  teacherId: number | null;
  courseDescription: string | null;
  shardId: string | null;
}


// 🔧 map your backend DTO → UI card model
function mapDtoToCourse(dto: CourseDto): Course {
  return {
    id: String(dto.classId),
    courseName: dto.courseName,
    subject: "—", // not in DTO; placeholder or derive from another API if you add it later
    section: dto.semester ?? "—",
    instructor: dto.teacherId != null ? `Teacher #${dto.teacherId}` : "TBA",
    credits: 3, // not in DTO; set constant or extend API later
    meetingTime: "See syllabus", // not in DTO
    description: dto.courseDescription ?? "No description provided.",
  };
}

export default function StudentCourseListingPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // For now, hardcode the student id. You can pass via route or auth context later.
  // Optionally read ?studentId=123 from URL if present:
  const params = useSearchParams();
  const studentId = useMemo(() => {
    const fromQuery = params?.get("studentId");
    return fromQuery ? parseInt(fromQuery, 10) : 1; // default to 1
  }, [params]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setErrorMsg("");

        const url = `http://localhost:8080/api/users/courses/user/${studentId}?role=STUDENT`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // If you use cookies/session later, include: credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
              `Failed to fetch courses (${res.status}): ${text || res.statusText}`
          );
        }

        const data: CourseDto[] = await res.json();
        setCourses(data.map(mapDtoToCourse));
      } catch (err: any) {
        setErrorMsg(err?.message || "Unable to load courses.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [studentId]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/course-chat?course=${courseId}`);
  };

  const handleJoinCourse = () => {
    router.push("/course-enrollment");
  };

  return (
      <>
        <Navbar />
        <div className={styles.pageContainer}>
          <main className={styles.mainContent}>
            {/* Welcome Section */}
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeMessage}>Hello, John</h1>
              <p className={styles.subtitle}>
                Choose a class below to get personalized help from your AI
                Teaching Assistant. Each assistant is trained on materials
                specific to that class, so you&apos;ll get accurate and targeted
                support.
              </p>
            </div>

            {/* Courses Section */}
            <div className={styles.coursesSection}>
              <h2 className={styles.sectionTitle}>Your Courses</h2>

              {loading && <p>Loading courses…</p>}
              {!loading && errorMsg && (
                  <p style={{ color: "crimson", fontWeight: 600 }}>{errorMsg}</p>
              )}
              {!loading && !errorMsg && courses.length === 0 && (
                  <p>No courses yet. Try joining one!</p>
              )}

              <div className={styles.courseGrid}>
                {courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        courseTitle={course.courseName}
                        nextExam={"—"}             // not from backend; fill later
                        reviewTopic={course.section} // using semester here for display
                        onClick={() => handleCourseClick(course.id)}
                    />
                ))}
              </div>
            </div>

            {/* Join Course Button */}
            <div className={styles.joinSection}>
              <Button label="Join a Course" onClick={handleJoinCourse} />
            </div>
          </main>
        </div>
        <Footer />
      </>
  );
}