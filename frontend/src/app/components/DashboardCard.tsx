import React from "react";
import Button from "./Button";
import styles from "./DashboardCard.module.css";

interface DashboardCardProps {
  title: string;
  content: string[];
  buttonText?: string;
  isHighlighted?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  content,
  buttonText = "View Full Info",
  isHighlighted = false,
}) => {
  return (
    <div
      className={`${styles.card} ${isHighlighted ? styles.highlighted : ""}`}
    >
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.contentList}>
        {content.map((item, index) => (
          <li key={index} className={styles.listItem}>
            {item}
          </li>
        ))}
      </ul>
      <div className={styles.buttonContainer}>
        <Button label={buttonText} />
      </div>
    </div>
  );
};

export default DashboardCard;
