import React from "react";
import FeatureBlock from "./FeatureBlock";
import styles from "./FeatureBlock.module.css";

export default function FeatureSection() {
  return (
    <section className={styles.container}>
      <div className={styles.featuresGrid}>
        <FeatureBlock
          iconSrc="/knightro.png"
          iconAlt="Real-time help icon"
          title="Real-Time Help for Students"
          description="AskKnightro gives students quick, reliable help with their assignments and questions, so they never feel stuck or alone in their learning."
        />
        <FeatureBlock
          iconSrc="/knightro.png"
          iconAlt="24/7 support icon"
          title="24/7 Academic Support"
          description="AskKnightro stays available when teachers can't, reinforcing lessons and helping students stay engaged — even after hours."
        />
        <FeatureBlock
          iconSrc="/knightro.png"
          iconAlt="Smart teaching icon"
          title="Smarter Teaching with Data"
          description="Teachers get a clear view of where students need help, with insights and summaries to guide personalized instruction."
        />
      </div>
    </section>
  );
}
