"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";
import DashboardCard from "../../components/DashboardCard";
import Link from "next/link";
import styles from "../teacher-course-dashboard.module.css";

interface Props {
  params: { id: string };
}

function makeTitleFromId(id: string) {
  if (!id) return id;
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function TeacherCoursePage({ params }: Props) {
  const { id } = params;
  const title = makeTitleFromId(id);

  const courseInfoContent = [
    `${title} - Course Code: ${id}`,
    "Section: 001",
    "Students Enrolled: 0 (placeholder)",
    "Schedule: T/Th 10:00-11:15",
  ];

  const materialsContent = [
    "No materials uploaded yet (placeholder)",
  ];

  const queriesContent = [
    "No recent queries",
  ];

  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.dashboardContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              {title} Dashboard
              <span className={styles.profileIcon}>👤</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Instructor tools and management for this course.
            </p>
          </div>

          <div className={styles.cardsGrid}>
            <div className={styles.topRow}>
              <DashboardCard
                title="Course Information"
                content={courseInfoContent}
                buttonText="Edit Course"
              />
              <DashboardCard
                title="Materials"
                content={materialsContent}
                buttonText="Manage Materials"
              />
              <DashboardCard
                title="Student Queries"
                content={queriesContent}
                buttonText="View Queries"
              />
            </div>

            <div className={styles.bottomRow}>
              <DashboardCard
                title="Escalations & Issues"
                content={["No escalations"]}
                buttonText="View"
              />
            </div>
          </div>

          <div className={styles.backLinkContainer}>
            <Link href="/teacher-course-dashboard" className={styles.backLink}>
              Back to Dashboard Index
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
