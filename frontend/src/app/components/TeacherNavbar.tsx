"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TeacherNavbarItem from "./TeacherNavbarItem";
import styles from "./TeacherNavbar.module.css";

const TeacherNavbarContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get courseId from URL parameters (used by all teacher pages)
  const courseId = searchParams.get("course") || searchParams.get("courseId");

  const handleNavigation = (label: string) => {
    switch (label) {
      case "Dashboard":
        if (courseId) {
          router.push(`/teacher-course-dashboard?course=${courseId}`);
        } else {
          router.push("/teacher-course-dashboard");
        }
        break;
      case "Edit Course":
        if (courseId) {
          router.push(`/course-info?courseId=${courseId}`);
        } else {
          router.push("/course-info");
        }
        break;
      case "Manage Members":
        if (courseId) {
          router.push(`/students-in-course?courseId=${courseId}`);
        } else {
          router.push("/students-in-course");
        }
        break;
      case "Course Logs":
        if (courseId) {
          router.push(`/course-logs?courseId=${courseId}`);
        } else {
          console.warn("No course ID found in URL parameters");
          router.push("/course-logs");
        }
        break;
      default:
        break;
    }
  };

  const navItems = [
    { icon: "dashboard.png", label: "Dashboard", isActive: true },
    { icon: "log-in.png", label: "Course Logs", isActive: false },
    { icon: "edit.png", label: "Edit Course", isActive: false },
  ];

  return (
    <nav className={styles.teacherNavbar}>
      <div className={styles.navItems}>
        {navItems.map((item, index) => (
          <TeacherNavbarItem
            key={index}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            onClick={() => handleNavigation(item.label)}
          />
        ))}
      </div>
    </nav>
  );
};

const TeacherNavbar: React.FC = () => {
  return (
    <Suspense fallback={
      <nav className={styles.teacherNavbar}>
        <div className={styles.navItems}>Loading...</div>
      </nav>
    }>
      <TeacherNavbarContent />
    </Suspense>
  );
};

export default TeacherNavbar;
