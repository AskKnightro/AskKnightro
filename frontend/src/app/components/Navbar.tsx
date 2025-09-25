"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onKey]);

  return (
    <header className={`${styles.navRoot} ${open ? styles.open : ""}`}>
      <nav className={styles.inner} aria-label="Main navigation">
        <div className={styles.logo}>
          <Image
            src="/knightro.png"
            alt="AskKnightro Logo"
            width={40}
            height={40}
            priority
          />
        </div>
        <div className={styles.links}>
          <a className={styles.link} href="/">
            Home
          </a>
          <a className={styles.link} href="/student-dashboard">
            Dashboard
          </a>
          <a className={styles.link} href="/course">
            Courses
          </a>
          <a className={styles.link} href="/view-profile">
            View Profile
          </a>
        </div>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={styles.hamburger}
          onClick={() => setOpen((o) => !o)}
          type="button"
        >
          <span />
        </button>
      </nav>
      <div id="mobile-menu" className={styles.mobileMenu} role="menu">
        <a
          className={styles.mobileLink}
          role="menuitem"
          href="/"
          onClick={() => setOpen(false)}
        >
          Home
        </a>
        <a
          className={styles.mobileLink}
          role="menuitem"
          href="/student-dashboard"
          onClick={() => setOpen(false)}
        >
          Dashboard
        </a>
        <a
          className={styles.mobileLink}
          role="menuitem"
          href="/course"
          onClick={() => setOpen(false)}
        >
          Courses
        </a>
        <a
          className={styles.mobileLink}
          role="menuitem"
          href="/view-profile"
          onClick={() => setOpen(false)}
        >
          View Profile
        </a>
      </div>
    </header>
  );
}
