import React from "react";
import Image from "next/image";
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
  const isImageIcon = icon.endsWith(".png") || icon.endsWith(".jpg") || icon.endsWith(".svg");

  return (
    <div
      className={`${styles.navItem} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <div className={styles.iconContainer}>
        {isImageIcon ? (
          <Image
            src={`/${icon}`}
            alt={label}
            width={24}
            height={24}
            className={styles.iconImage}
          />
        ) : (
          <span className={styles.icon}>{icon}</span>
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default TeacherNavbarItem;
