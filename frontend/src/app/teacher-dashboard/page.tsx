"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeacherTopNavbar from "../components/TeacherTopNavbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import styles from "../student-dashboard/student-dashboard.module.css";

// UI card model
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

// Backend DTOs
interface CourseDto {
    classId: number;
    enrollmentCode: string;
    courseName: string;
    semester: string;
    teacherId: number | null;
    courseDescription: string | null;
    shardId: string | null;
}

interface TeacherDto {
    teacherId: number;
    name: string;
    email: string;
    department?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
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
        description: dto.courseDescription || "No description provided.",
    };
}

export default function TeacherDashboardPage() {
    const router = useRouter();

    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [teacherName, setTeacherName] = useState<string>("Professor");
    const [loadingTeacher, setLoadingTeacher] = useState<boolean>(true);

    const [courses, setCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Load teacherId from storage on client side only
    useEffect(() => {
        const id = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
        if (id) {
            setTeacherId(parseInt(id, 10));
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

    // Fetch teacher name
    useEffect(() => {
        if (!teacherId) return; // Don't fetch until teacherId is available
        let cancelled = false;
        (async () => {
            try {
                setLoadingTeacher(true);
                const res = await fetch(
                    `http://localhost:8080/api/users/teachers/${teacherId}`,
                    { headers: getAuthHeaders(), cache: "no-store" }
                );
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

    // Fetch courses taught by this teacher
    useEffect(() => {
        if (!teacherId) return; // Don't fetch until teacherId is available
        let cancelled = false;
        (async () => {
            try {
                setLoadingCourses(true);
                setErrorMsg("");
                const url = `http://localhost:8080/api/users/courses/user/${teacherId}?role=TEACHER`;
                const res = await fetch(url, {
                    method: "GET",
                    headers: getAuthHeaders(),
                    cache: "no-store",
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(
                        `Failed to fetch courses (${res.status}): ${text || res.statusText}`
                    );
                }

                const data: CourseDto[] = await res.json();
                if (!cancelled) setCourses(data.map(mapDtoToCourse));
            } catch (err) {
                if (!cancelled) {
                    setErrorMsg(
                        err instanceof Error ? err.message : "Unable to load courses."
                    );
                    setCourses([]);
                }
            } finally {
                if (!cancelled) setLoadingCourses(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [teacherId]);

    const handleCourseClick = (courseId: string) => {
        router.push(`/teacher-course-dashboard?course=${courseId}`);
    };

    const handleCreateCourse = () => {
        router.push(`/create-course`);
    };

    return (
        <>
            <TeacherTopNavbar />
            <div className={styles.pageContainer}>
                <main className={styles.mainContent}>
                {/* Welcome */}
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeMessage}>
                        {loadingTeacher ? "Loading…" : `Hello, ${teacherName}`}
                    </h1>
                    <p className={styles.subtitle}>
                        This is your dashboard hub. From here, you can create new courses, manage existing ones,
                        and set up AI Teaching Assistants trained specifically on your course materials.
                    </p>
                    
                </div>

                {/* Courses */}
                <div className={styles.coursesSection}>
                    <h2 className={styles.sectionTitle}>Your Courses</h2>

                    {loadingCourses && <p>Loading courses…</p>}
                    {!loadingCourses && errorMsg && (
                        <p style={{ color: "crimson", fontWeight: 600 }}>{errorMsg}</p>
                    )}
                    {!loadingCourses && !errorMsg && courses.length === 0 && (
                        <p style={{ color: "#000" }}>You don&apos;t have any courses yet.</p>
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
                    {/* Create Course button */}
                    <div style={{ marginTop: 16 }}>
                        <Button label="Create Course" onClick={handleCreateCourse} />
                    </div>
                </div>
            </main>
        </div>
        <Footer />
    </>
    );
}