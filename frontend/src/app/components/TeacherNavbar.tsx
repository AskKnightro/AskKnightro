import React from "react";
import TeacherNavbarItem from "./TeacherNavbarItem";
import styles from "./TeacherNavbar.module.css";

const TeacherNavbar: React.FC = () => {
  const navItems = [
    { icon: "✓", label: "Dashboard", isActive: true },
    { icon: "↕", label: "Course Logs", isActive: false },
    { icon: "✏", label: "Edit Course", isActive: false },
    { icon: "📈", label: "Analytics", isActive: false },
    { icon: "👥", label: "Manage Members", isActive: false },
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
          />
        ))}
      </div>
    </nav>
  );
};

export default TeacherNavbar;
