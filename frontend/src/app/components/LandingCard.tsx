import React from "react";
import Image from "next/image";
import styles from "./LandingCard.module.css";

interface LandingCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

export default function LandingCard({
  imageSrc,
  imageAlt,
  title,
  description,
}: LandingCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={80}
          height={80}
          className={styles.image}
        />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
