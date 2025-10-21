"use client";

import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";
import LandingCard from "./components/LandingCard";
import FeatureSection from "./components/FeatureSection";
import FAQ from "./components/FAQ";
import HeroSection from "./components/HeroSection";
import styles from "./components/LandingCard.module.css";

export default function Home() {
  return (
    <>
      <HomeNavbar />

      <HeroSection />

      <FeatureSection />

      <div className={styles.section}>
        <h1 className={styles.mainTitle}>Featured Highlights</h1>
        <p className={styles.subheading}>
          Discover amazing stories and achievements from our community
        </p>
        <div className={styles.cardsContainer}>
          <LandingCard
            imageSrc="/face1.png"
            imageAlt="Teacher"
            title="For Teachers"
            description="Streamline your classroom management, create engaging lessons, and track student progress with our intuitive teaching tools designed to make education more effective."
          />
          <LandingCard
            imageSrc="/face2.png"
            imageAlt="Student"
            title="For Students"
            description="Get personalized learning experiences, instant homework help, and study resources that adapt to your learning style to help you succeed academically."
          />
          <LandingCard
            imageSrc="/face3.png"
            imageAlt="Family"
            title="For Families"
            description="Stay connected with your child's education, monitor their academic progress, and access resources to support their learning journey at home."
          />
        </div>
      </div>

      <FAQ />

      <Footer />
    </>
  );
}
