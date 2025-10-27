// src/app/components/CourseCard.tsx
import React from "react";
import styles from "./CourseCard.module.css";

interface CourseCardProps {
    courseTitle: string;
    nextExam: string;
    reviewTopic: string;
    description?: string;
    onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
                                                   courseTitle,
                                                   nextExam,
                                                   reviewTopic,
                                                   description,
                                                   onClick,
                                               }) => {
    return (
        <div className={styles.courseCard} onClick={onClick} role="button" tabIndex={0}
             onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}>
            <div className={styles.cardHeader}>
                <div className={styles.ellipsisIcon}>⋯</div>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.courseTitle}>{courseTitle}</h3>
                <p className={styles.examInfo}>{nextExam}</p>
                <p className={styles.reviewInfo}>{reviewTopic}</p>

                {description && (
                    <p className={styles.description} title={description}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CourseCard;