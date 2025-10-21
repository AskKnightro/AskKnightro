"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./materials-overview.module.css";

const MaterialsOverviewPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Materials Overview</h1>
            <p className={styles.pageSubtitle}>
              Manage course materials, uploads, and resources
            </p>
          </div>

          <div className={styles.contentSection}>
            <div className={styles.materialsCard}>
              <h2 className={styles.sectionTitle}>Course Documents</h2>
              <p className={styles.placeholder}>
                Uploaded documents and files will appear here...
              </p>
            </div>

            <div className={styles.materialsCard}>
              <h2 className={styles.sectionTitle}>Assignments & Quizzes</h2>
              <p className={styles.placeholder}>
                Assignment materials and quiz resources will be listed here...
              </p>
            </div>

            <div className={styles.materialsCard}>
              <h2 className={styles.sectionTitle}>Upload New Materials</h2>
              <p className={styles.placeholder}>
                File upload interface will be implemented here...
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

export default MaterialsOverviewPage;
