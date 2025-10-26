"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Footer from "../components/Footer";
import styles from "./confirm-signup.module.css";

export default function ConfirmSignupPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get email from URL params if passed from signup page
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    const newCode = [...code];
    for (let i = 0; i < digits.length; i++) {
      newCode[i] = digits[i] || "";
    }
    setCode(newCode);
    setError("");

    // Focus the next empty input or the last one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleConfirm = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call for confirmation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just simulate success and redirect
      console.log("Confirmation code:", fullCode);

      // Redirect to login page
      router.push("/login?confirmed=true");
    } catch {
      setError("Invalid confirmation code. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Logo in top-left */}
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/knightro2.png"
          alt="AskKnightro Logo"
          width={60}
          height={60}
          className={styles.logo}
        />
      </Link>

      <div className={styles.mainContent}>
        <div className={styles.confirmCard}>
          <h1 className={styles.title}>Confirm Your Email</h1>
          <p className={styles.subtitle}>
            We&apos;ve sent a 6-digit verification code to
            <br />
            <strong>{email || "your email address"}</strong>
          </p>

          <div className={styles.form}>
            <div className={styles.codeContainer}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={styles.codeInput}
                  disabled={isLoading}
                />
              ))}
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
            <div className={styles.buttonContainer}>
              <Button
                label={isLoading ? "Confirming..." : "Confirm"}
                onClick={handleConfirm}
                disabled={isLoading}
              />
            </div>{" "}
            <p className={styles.backLink}>
              <Link href="/signup" className={styles.link}>
                ← Back to Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
