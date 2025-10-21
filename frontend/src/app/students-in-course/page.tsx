"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./students-in-course.module.css";

const StudentsInCoursePage: React.FC = () => {
  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Students in Course</h1>
            <p className={styles.pageSubtitle}>
              View and manage students enrolled in your course
            </p>
          </div>

          <div className={styles.contentSection}>
            <div className={styles.studentsCard}>
              <h2 className={styles.sectionTitle}>Enrolled Students</h2>
              <p className={styles.placeholder}>
                Student list will be loaded from database...
              </p>
            </div>

            <div className={styles.studentsCard}>
              <h2 className={styles.sectionTitle}>Manage Members</h2>
              <p className={styles.placeholder}>
                Add/remove students and manage enrollment will be implemented
                here...
              </p>
            </div>
          </div>

          <div className={styles.backLinkContainer}>
            <Link href="/teacher-course-dashboard" className={styles.backLink}>
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default StudentsInCoursePage;
