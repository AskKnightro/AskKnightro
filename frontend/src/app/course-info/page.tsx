"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./course-info.module.css";

const CourseInfoPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Course Information & Settings</h1>
            <p className={styles.pageSubtitle}>
              Manage your course details, settings, and configurations
            </p>
          </div>

          <div className={styles.contentSection}>
            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Course Details</h2>
              <p className={styles.placeholder}>
                Course information will be loaded from database...
              </p>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Course Settings</h2>
              <p className={styles.placeholder}>
                Course settings and configuration options will appear here...
              </p>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Edit Course</h2>
              <p className={styles.placeholder}>
                Course editing interface will be implemented here...
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

export default CourseInfoPage;
