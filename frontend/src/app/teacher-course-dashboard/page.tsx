"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";
import styles from "./teacher-course-dashboard.module.css";

const TeacherCourseDashboard: React.FC = () => {
  const router = useRouter();

  // All content arrays are now empty - to be populated from database
  const courseInfoContent: string[] = [];
  const materialsContent: string[] = [];
  const studentsContent: string[] = [];

  // Navigation functions
  const navigateToCourseInfo = () => router.push("/course-info");
  const navigateToMaterials = () => router.push("/materials-overview");
  const navigateToStudents = () => router.push("/students-in-course");

  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.dashboardContainer}>
        <main className={styles.mainContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Hello, Professor Doe
              <span className={styles.profileIcon}>👤</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Ready to teach? Your course is ready to go.
            </p>

            {/* Decorative chart visualization */}
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
            {/* Row 1: Three cards side by side */}
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

      <Footer />
    </>
  );
};

export default TeacherCourseDashboard;
