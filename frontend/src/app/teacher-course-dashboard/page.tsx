"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";
import styles from "./teacher-course-dashboard.module.css";

// Optional: force dynamic to avoid static prerender issues
export const dynamic = "force-dynamic";

type TeacherDto = {
  teacherId: number;
  name: string;
  email: string;
  department?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
};

/** Shell with Suspense boundary (REQUIRED for useSearchParams) */
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

/** Inner component can safely call useSearchParams now */
function TeacherCourseDashboardContent() {
  const router = useRouter();
  const params = useSearchParams();

  const teacherId = useMemo(() => {
    const q = params?.get("teacherId");
    return q ? parseInt(q, 10) : 1; // fallback for local testing
  }, [params]);

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

  // placeholders until wired to real data
  const courseInfoContent: string[] = [];
  const materialsContent: string[] = [];
  const studentsContent: string[] = [];

  const navigateToCourseInfo = () => router.push("/course-info");
  const navigateToMaterials = () => router.push("/materials-overview");
  const navigateToStudents = () => router.push("/students-in-course");

  return (
      <div className={styles.dashboardContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              {loadingTeacher ? "Loading…" : `Hello, ${teacherName}`}
              <span className={styles.profileIcon}>👤</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Ready to teach? Your course is ready to go.
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
                  buttonText="View All"
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