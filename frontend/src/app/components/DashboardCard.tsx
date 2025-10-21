import React from "react";
import Button from "./Button";
import styles from "./DashboardCard.module.css";

interface DashboardCardProps {
  title: string;
  content: string[];
  buttonText?: string;
  isHighlighted?: boolean;
  onButtonClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  content,
  buttonText = "View Full Info",
  isHighlighted = false,
  onButtonClick,
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
        <Button label={buttonText} onClick={onButtonClick} />
      </div>
    </div>
  );
};

export default DashboardCard;
