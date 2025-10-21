"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import Button from "../components/Button";
import styles from "./student-course-listing.module.css";

interface Course {
  id: string;
  courseTitle: string;
  nextExam: string;
  reviewTopic: string;
}

export default function StudentCourseListingPage() {
  const router = useRouter();

  // Mock course data as specified
  const courses: Course[] = [
    {
      id: "cs101",
      courseTitle: "CS101: Intro to Computer Science",
      nextExam: "Next exam: Tomorrow at 12:30PM",
      reviewTopic: "Review: Linked Lists",
    },
    {
      id: "db101",
      courseTitle: "DB101: Database Systems",
      nextExam: "Next exam: Thursday at 9:00AM",
      reviewTopic: "Review: SQL Statements",
    },
    {
      id: "cs102",
      courseTitle: "CS102: Deeper into Computer Science",
      nextExam: "Next exam: 4/19 at 6:30PM",
      reviewTopic: "Review: Graphs",
    },
  ];

  const handleCourseClick = (courseId: string) => {
    // Navigate to course chat with the selected course
    router.push(`/course-chat?course=${courseId}`);
  };

  const handleJoinCourse = () => {
    // Navigate to course enrollment page
    router.push("/course-enrollment");
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* Welcome Section */}
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeMessage}>Hello, John</h1>
            <p className={styles.subtitle}>
              Choose a class below to get personalized help from your AI
              Teaching Assistant. Each assistant is trained on materials
              specific to that class, so you'll get accurate and targeted
              support.
            </p>
          </div>

          {/* Courses Section */}
          <div className={styles.coursesSection}>
            <h2 className={styles.sectionTitle}>View Courses</h2>

            <div className={styles.courseGrid}>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  courseTitle={course.courseTitle}
                  nextExam={course.nextExam}
                  reviewTopic={course.reviewTopic}
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}
            </div>
          </div>

          {/* Join Course Button */}
          <div className={styles.joinSection}>
            <Button label="Join a Course" onClick={handleJoinCourse} />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
