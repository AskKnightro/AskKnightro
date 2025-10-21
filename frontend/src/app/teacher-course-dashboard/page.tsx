"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import DashboardCard from "../components/DashboardCard";
import Link from "next/link";
import styles from "./teacher-course-dashboard.module.css";

const TeacherCourseDashboard: React.FC = () => {
  const courseInfoContent = [
    "Intro to Psychology - PSY101",
    "Fall 2025 - Section 002",
    "32 Students Enrolled",
    "Meeting: MWF 10:00-10:50 AM",
  ];

  const materialsContent = [
    "Lecture 5 slides.pdf - Uploaded 2 days ago",
    "Chapter 3 Reading.pdf - Uploaded 1 week ago",
    "Quiz 2 Instructions.docx - Uploaded 3 days ago",
    "Homework Assignment 4.pdf - Uploaded 5 days ago",
  ];

  const queriesContent = [
    "2h ago - Taylor M. asked about Quiz 2",
    "Yesterday - Jordan L. requested extension",
    "2 days ago - Alex P. question on Chapter 3",
    "3 days ago - Sam R. grade inquiry",
  ];

  const escalationsContent = [
    "Quiz Flag - Today",
    "Upload Fail - Apr 15",
    "Grade Issue - Apr 12",
    "System Error - Apr 10",
  ];

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
              />
              <DashboardCard
                title="Materials Overview"
                content={materialsContent}
                buttonText="View All"
                isHighlighted={true}
              />
              <DashboardCard
                title="Recent Student Queries"
                content={queriesContent}
                buttonText="View All"
              />
            </div>

            {/* Row 2: Full-width card */}
            <div className={styles.bottomRow}>
              <DashboardCard
                title="Latest Instructor Escalations"
                content={escalationsContent}
                buttonText="View All"
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
