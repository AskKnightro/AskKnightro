"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";
import styles from "./teacher-course-dashboard.module.css";

export const dynamic = "force-dynamic";

type TeacherDto = {
  teacherId: number;
  name: string;
  email: string;
  department?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
};

type StudentDto = {
  studentId: number;
  name: string;
  email: string;
  profilePicture?: string | null;
  yearStanding?: string | null;
  major?: string | null;
};

type CourseDto = {
  classId: number;
  enrollmentCode: string;
  courseName: string;
  semester: string;
  teacherId: number | null;
  courseDescription: string | null;
  shardId: string | null;
};

export default function TeacherCourseDashboardPage() {
  return (
      <>
        <Navbar />
        <TeacherNavbar />
        <Suspense
            fallback={
              <div className={styles.dashboardContainer}>
                <main className={styles.mainContent}>
                  <h1>Loading…</h1>
                </main>
              </div>
            }
        >
          <TeacherCourseDashboardContent />
        </Suspense>
        <Footer />
      </>
  );
}

function TeacherCourseDashboardContent() {
  const router = useRouter();
  const params = useSearchParams();

  // teacherId from URL (?teacherId=2) or default to 1
  const teacherId = useMemo(() => {
    const q = params?.get("teacherId");
    return q ? parseInt(q, 10) : 1;
  }, [params]);

  // courseId is REQUIRED to show course data
  const courseId = useMemo(() => {
    const q = params?.get("course");
    return q ? parseInt(q, 10) : undefined;
  }, [params]);

  // ---------- Teacher header ----------
  const [teacherName, setTeacherName] = useState<string>("Professor");
  const [loadingTeacher, setLoadingTeacher] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingTeacher(true);
        const res = await fetch(`http://localhost:8080/api/users/teachers/${teacherId}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const t: TeacherDto = await res.json();
          if (!cancelled) setTeacherName(t?.name || "Professor");
        } else if (!cancelled) {
          setTeacherName("Professor");
        }
      } catch {
        if (!cancelled) setTeacherName("Professor");
      } finally {
        if (!cancelled) setLoadingTeacher(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  // ---------- Course details (fills Course Information card) ----------
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [loadingCourse, setLoadingCourse] = useState<boolean>(true);
  const [courseError, setCourseError] = useState<string>("");

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      setLoadingCourse(false);
      setCourseError("No course selected.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingCourse(true);
        setCourseError("");
        const res = await fetch(`http://localhost:8080/api/users/courses/${courseId}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load course (${res.status}): ${text || res.statusText}`);
        }
        const dto: CourseDto = await res.json();
        if (!cancelled) setCourse(dto);
      } catch (err: unknown) {
        if (!cancelled) {
          setCourse(null);
          setCourseError(err instanceof Error ? err.message : "Unable to load course.");
        }
      } finally {
        if (!cancelled) setLoadingCourse(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // ---------- Students for the selected course ----------
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [studentsError, setStudentsError] = useState<string>("");

  useEffect(() => {
    if (!courseId) {
      setStudents([]);
      setLoadingStudents(false);
      setStudentsError("No course selected.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingStudents(true);
        setStudentsError("");
        const res = await fetch(`http://localhost:8080/api/enrollments/${courseId}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load students (${res.status}): ${text || res.statusText}`);
        }
        const list: StudentDto[] = await res.json();
        if (!cancelled) setStudents(list);
      } catch (err: unknown) {
        if (!cancelled) {
          setStudents([]);
          setStudentsError(err instanceof Error ? err.message : "Unable to load students.");
        }
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // ---------- Card content builders ----------
  const courseInfoContent: string[] = (() => {
    if (!courseId) return ["No course selected"];
    if (loadingCourse) return ["Loading course…"];
    if (courseError) return [courseError];
    if (!course) return ["Course not found."];

    return [
      `Title: ${course.courseName}`,
      `Semester: ${course.semester || "—"}`,
      `Enrollment Code: ${course.enrollmentCode || "—"}`,
      `Teacher: ${teacherName} ${course.teacherId ? `(ID: ${course.teacherId})` : ""}`.trim(),
      `Shard: ${course.shardId || "—"}`,
      `Course ID: ${course.classId}`,
      ...(course.courseDescription ? [`Description: ${course.courseDescription}`] : []),
    ];
  })();

  const materialsContent: string[] = ["Coming soon…"];

  const studentsContent: string[] =
      students.length > 0
          ? students.slice(0, 5).map((s) => `${s.name} (${s.email})`)
          : studentsError
              ? [studentsError]
              : loadingStudents
                  ? ["Loading students…"]
                  : ["No students enrolled yet."];

  // ---------- Navigation helpers (preserve courseId) ----------
  const navigateToCourseInfo = () => {
    if (!courseId) return;
    router.push(`/course-info?course=${courseId}`);
  };
  const navigateToMaterials = () => {
    if (!courseId) return;
    router.push(`/materials-overview?course=${courseId}`);
  };
  const navigateToStudents = () => {
    if (!courseId) return;
    router.push(`/students-in-course?course=${courseId}&teacherId=${teacherId}`);
  };

  return (
      <div className={styles.dashboardContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              {loadingTeacher ? "Loading…" : `Hello, ${teacherName}`}
              <span className={styles.profileIcon}></span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              {courseId ? "Ready to teach? Your course is ready to go." : "Please select a course from your list."}
            </p>

            <div className={styles.chartVisualization}>
              <svg width="80" height="40" viewBox="0 0 80 40">
                <polyline
                    points="10,30 20,25 30,15 40,20 50,10 60,15 70,5"
                    fill="none"
                    stroke="#87ceeb"
                    strokeWidth="2"
                />
                <circle cx="10" cy="30" r="2" fill="#87ceeb" />
                <circle cx="30" cy="15" r="2" fill="#87ceeb" />
                <circle cx="50" cy="10" r="2" fill="#87ceeb" />
                <circle cx="70" cy="5" r="2" fill="#87ceeb" />
              </svg>
            </div>
          </div>

          <div className={styles.cardsGrid}>
            <div className={styles.topRow}>
              <DashboardCard
                  title="Course Information"
                  content={courseInfoContent}
                  buttonText="View Full Info"
                  onButtonClick={navigateToCourseInfo}
              />
              <DashboardCard
                  title="Materials Overview"
                  content={materialsContent}
                  buttonText="View All"
                  onButtonClick={navigateToMaterials}
              />
              <DashboardCard
                  title="View Students"
                  content={studentsContent}
                  buttonText={courseId ? `View All (${students.length})` : "Select a Course"}
                  onButtonClick={navigateToStudents}
              />
            </div>
          </div>

          <div className={styles.backLinkContainer}>
            <Link href="/" className={styles.backLink}>
              Back to Home
            </Link>
          </div>
        </main>
      </div>
  );
}