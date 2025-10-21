import React from "react";
import styles from "./page.module.css";

interface Props {
  params: { id: string };
}

export default function CoursePage({ params }: Props) {
  const { id } = params;

  return (
    <div className={styles.container}>
      <h1>Course: {id}</h1>
      <p>
        This is a placeholder page for course <strong>{id}</strong>.
      </p>
      <p>Implement course details here (syllabus, progress, lessons, etc.).</p>
    </div>
  );
}
