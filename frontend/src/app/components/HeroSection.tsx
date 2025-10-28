"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check both sessionStorage and localStorage for user role
    const groupsStr = sessionStorage.getItem("groups") ?? localStorage.getItem("groups");
    if (groupsStr) {
      const groups = JSON.parse(groupsStr) as string[];
      if (groups.includes("student")) {
        setUserRole("student");
      } else if (groups.includes("teacher")) {
        setUserRole("teacher");
      }
    }
    setIsLoading(false);
  }, []);

  const handleGetStarted = () => {
    if (isLoading) return;

    // Navigate based on user role
    if (userRole === "student") {
      router.push("/student-dashboard");
    } else if (userRole === "teacher") {
      router.push("/teacher-dashboard");
    } else {
      router.push("/signup");
    }
  };

  return (
    <section className={styles.heroContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.textContent}>
          <h1 className={styles.mainHeadline}>
            Your AI Teaching Assistant, Reimagined.
          </h1>
          <h2 className={styles.subHeadline}>
            Smarter support. Faster answers. AI that actually helps.
          </h2>
          <p className={styles.bodyText}>
            Whether you&apos;re reviewing tough concepts, prepping for exams, or
            just need a quick explanation, AskKnightro delivers real-time,
            personalized support grounded in your actual course content.
            It&apos;s like having a tutor in your corner—available anytime,
            anywhere.
          </p>
          <div className={styles.ctaContainer}>
            <Button label="Get Started" onClick={handleGetStarted} />
          </div>
        </div>
        <div className={styles.imageContainer}>
          <div className={styles.gradientOverlay}></div>
        </div>
      </div>
    </section>
  );
}
