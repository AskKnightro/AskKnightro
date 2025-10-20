"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/Button";
import Footer from "../components/Footer";
import styles from "./login.module.css";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError("Email is required");
      return false;
    }
    if (
      !emailValue.endsWith("@gmail.com") &&
      !emailValue.endsWith("@ucf.edu")
    ) {
      setEmailError("Email must end with @gmail.com or @ucf.edu");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError("");
    }
  };

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return;
    }

    if (!password) {
      alert("Password is required");
      return;
    }

    console.log("Login clicked", { email, password, rememberMe });
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
        {/* Left Column - Login Form */}
        <div className={styles.leftColumn}>
          <div className={styles.loginCard}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.subtitle}>
              Your AI-powered assistant is ready when you are.
            </p>

            <form className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className={`${styles.input} ${
                    emailError ? styles.inputError : ""
                  }`}
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                />
                {emailError && (
                  <span className={styles.errorMessage}>{emailError}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Image
                        src="/eye.png"
                        alt="Hide password"
                        width={20}
                        height={16}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <Image
                        src="/eyebrow.png"
                        alt="Show password"
                        width={20}
                        height={16}
                        style={{ objectFit: "contain" }}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>

              <div className={styles.buttonContainer}>
                <Button label="Login" onClick={handleLogin} />
              </div>

              <p className={styles.signupLink}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className={styles.link}>
                  Sign up now
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Column - Promotional Section */}
        <div className={styles.rightColumn}>
          <div className={styles.promoContent}>
            <h2 className={styles.welcomeTitle}>Welcome Back!</h2>
            <p className={styles.welcomeSubtitle}>
              Learning never stops, and neither do we
            </p>

            <div className={styles.illustrationContainer}>
              <Image
                src="/typing.png"
                alt="Student typing illustration"
                width={400}
                height={300}
                className={styles.illustration}
              />
            </div>
          </div>

          {/* Decorative dots pattern */}
          <div className={styles.dotsPattern}></div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
