"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function StudentNavbar() {
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
          <Link className={styles.link} href="/">
            Home
          </Link>
          <Link className={styles.link} href="/student-dashboard">
            Dashboard
          </Link>
          <Link className={styles.link} href="/course-enrollment">
            Join Course
          </Link>
          <Link className={styles.link} href="/student-profile">
            View Profile
          </Link>
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
        <Link
          className={styles.mobileLink}
          role="menuitem"
          href="/"
          onClick={() => setOpen(false)}
        >
          Home
        </Link>
        <Link
          className={styles.mobileLink}
          role="menuitem"
          href="/student-dashboard"
          onClick={() => setOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          className={styles.mobileLink}
          role="menuitem"
          href="/course-enrollment"
          onClick={() => setOpen(false)}
        >
          Join Course
        </Link>
        <Link
          className={styles.mobileLink}
          role="menuitem"
          href="/student-profile"
          onClick={() => setOpen(false)}
        >
          View Profile
        </Link>
      </div>
    </header>
  );
}

