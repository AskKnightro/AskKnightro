import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.primary}>
        © 2025 AskKnightro. All rights reserved
      </span>
      <a href="#" className={styles.link}>
        Private Policy
      </a>
      <a href="#" className={styles.link}>
        Terms of Use
      </a>
    </footer>
  );
}
