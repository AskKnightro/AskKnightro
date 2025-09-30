"use client";

import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  label,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
