"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Button from "./components/Button";
import LandingCard from "./components/LandingCard";
import FeatureSection from "./components/FeatureSection";
import FAQ from "./components/FAQ";
import Link from "next/link";
import styles from "./components/LandingCard.module.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <main
        style={{
          background: "white",
          color: "black",
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <h1>Home page</h1>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>

        <div
          style={{
            marginTop: "32px",
            marginBottom: "64px",
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/login">
            <Button label="Login" onClick={() => {}} />
          </Link>
          <Link href="/signup">
            <Button label="Sign Up" onClick={() => {}} />
          </Link>
        </div>

        <div className={styles.section}>
          <h1 className={styles.mainTitle}>Featured Highlights</h1>
          <p className={styles.subheading}>
            Discover amazing stories and achievements from our community
          </p>
        </div>

        <div className={styles.cardsContainer}>
          <LandingCard
            imageSrc="/lebron.png"
            imageAlt="LeBron James"
            title="Basketball Legend"
            description="Explore the incredible journey of one of basketball's greatest players and his impact on the sport."
          />
          <LandingCard
            imageSrc="/lebron.png"
            imageAlt="Achievement"
            title="Championship Glory"
            description="Witness the dedication and perseverance that leads to championship victories and legendary status."
          />
          <LandingCard
            imageSrc="/lebron.png"
            imageAlt="Inspiration"
            title="Inspiring Excellence"
            description="Learn how commitment to excellence and continuous improvement creates lasting impact and success."
          />
        </div>
      </main>

      <FeatureSection />

      <FAQ />

      <Footer />
    </>
  );
}
