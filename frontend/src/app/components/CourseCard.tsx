import React from "react";
import styles from "./CourseCard.module.css";

interface CourseCardProps {
  courseTitle: string;
  nextExam: string;
  reviewTopic: string;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  courseTitle,
  nextExam,
  reviewTopic,
  onClick,
}) => {
  return (
    <div className={styles.courseCard} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.ellipsisIcon}>⋯</div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.courseTitle}>{courseTitle}</h3>
        <p className={styles.examInfo}>{nextExam}</p>
        <p className={styles.reviewInfo}>{reviewTopic}</p>
      </div>
    </div>
  );
};

export default CourseCard;
