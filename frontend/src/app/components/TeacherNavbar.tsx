"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TeacherNavbarItem from "./TeacherNavbarItem";
import styles from "./TeacherNavbar.module.css";

const TeacherNavbar: React.FC = () => {
  const router = useRouter();

  const handleNavigation = (label: string) => {
    switch (label) {
      case "Dashboard":
        router.push("/teacher-course-dashboard");
        break;
      case "Edit Course":
        router.push("/course-info");
        break;
      case "Manage Members":
        router.push("/students-in-course");
        break;
      // Course Logs can be implemented later
      default:
        break;
    }
  };

  const navItems = [
    { icon: "✓", label: "Dashboard", isActive: true },
    { icon: "↕", label: "Course Logs", isActive: false },
    { icon: "✏", label: "Edit Course", isActive: false },
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

export default TeacherNavbar;
