import React from "react";
import styles from "./TeacherNavbarItem.module.css";

interface TeacherNavbarItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const TeacherNavbarItem: React.FC<TeacherNavbarItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default TeacherNavbarItem;
