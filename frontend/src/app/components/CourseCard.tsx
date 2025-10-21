import React from "react";
import styles from "./CourseCard.module.css";
import Link from "next/link";

interface CourseCardProps {
    id: string;
    courseTitle: string;
    numQuestions?: number;
    numStudents?: number;
    isTeacher?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
    id,
    courseTitle,
    numQuestions,
    numStudents,
    isTeacher = true,
}) => {
  return (
    <Link 
        href={isTeacher ? `/teacher-course-dashboard/${encodeURIComponent(id)}` : `/courses/${encodeURIComponent(id)}`}
        className={styles.link}
        >
      <article className={styles.card} role="article" aria-label={courseTitle}>
        <h3 className={styles.title}>{courseTitle}</h3>
        {typeof numQuestions === "number" && (
          <p className={styles.questions}>Questions: {numQuestions}</p>
        )}
        {typeof numStudents === "number" && (
          <p className={styles.questions}>Students: {numStudents}</p>
        )}
      </article>
    </Link>
  );
};

export default CourseCard;