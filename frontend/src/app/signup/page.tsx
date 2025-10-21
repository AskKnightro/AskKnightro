"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../components/Button";
import Footer from "../components/Footer";
import styles from "./signup.module.css";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

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

  const handleSignup = () => {
    setFormError(""); // Clear previous errors

    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      return;
    }

    if (!firstName || !lastName) {
      setFormError("First name and last name are required");
      return;
    }

    if (!userRole) {
      setFormError("Please select whether you are a student or teacher");
      return;
    }

    if (!password) {
      setFormError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (!agreeToTerms) {
      setFormError("You must agree to the terms and conditions");
      return;
    }

    console.log("Signup clicked", {
      firstName,
      lastName,
      email,
      password,
      userRole,
      agreeToTerms,
    });
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
        {/* Left Column - Promotional Section */}
        <div className={styles.leftColumn}>
          <div className={styles.promoContent}>
            <h2 className={styles.welcomeTitle}>Join AskKnightro!</h2>
            <p className={styles.welcomeSubtitle}>
              Start your learning journey with AI-powered assistance
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

        {/* Right Column - Signup Form */}
        <div className={styles.rightColumn}>
          <div className={styles.signupCard}>
            <h1 className={styles.title}>Sign Up</h1>
            <p className={styles.subtitle}>
              Create your account to get started
            </p>

            <form className={styles.form}>
              <div className={styles.nameRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.label}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className={styles.input}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.label}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className={styles.input}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>I am a...</label>
                <div className={styles.roleSelection}>
                  <label className={styles.roleOption}>
                    <input
                      type="radio"
                      name="userRole"
                      value="student"
                      checked={userRole === "student"}
                      onChange={(e) => setUserRole(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>Student</span>
                  </label>
                  <label className={styles.roleOption}>
                    <input
                      type="radio"
                      name="userRole"
                      value="teacher"
                      checked={userRole === "teacher"}
                      onChange={(e) => setUserRole(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioLabel}>Teacher</span>
                  </label>
                </div>
              </div>

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

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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

              <div className={styles.checkboxContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className={styles.checkbox}
                  />
                  I agree to the{" "}
                  <Link href="/terms" className={styles.link}>
                    Terms and Conditions
                  </Link>
                </label>
                {formError && (
                  <span className={styles.errorMessage}>{formError}</span>
                )}
              </div>

              <div className={styles.buttonContainer}>
                <Button label="Sign Up" onClick={handleSignup} />
              </div>

              <p className={styles.loginLink}>
                Already have an account?{" "}
                <Link href="/login" className={styles.link}>
                  Sign in now
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
