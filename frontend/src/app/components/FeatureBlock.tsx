import React from "react";
import Image from "next/image";
import styles from "./FeatureBlock.module.css";

interface FeatureBlockProps {
  iconSrc?: string;
  iconAlt?: string;
  title: string;
  description: string;
}

export default function FeatureBlock({
  iconSrc,
  iconAlt,
  title,
  description,
}: FeatureBlockProps) {
  return (
    <div className={styles.block}>
      <div className={styles.iconContainer}>
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={iconAlt || "Feature icon"}
            width={40}
            height={40}
            className={styles.icon}
          />
        ) : (
          <div className={styles.placeholderIcon}>📚</div>
        )}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
