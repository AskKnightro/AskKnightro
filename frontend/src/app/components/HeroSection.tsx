"use client";

import React from "react";
import Link from "next/link";
import Button from "./Button";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
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
            <Link href="/signup">
              <Button label="Get Started" onClick={() => {}} />
            </Link>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <div className={styles.gradientOverlay}></div>
        </div>
      </div>
    </section>
  );
}
