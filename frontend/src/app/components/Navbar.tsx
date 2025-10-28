"use client";

import React, { useState, useEffect } from "react";
import PublicNavbar from "./PublicNavbar";
import StudentNavbar from "./StudentNavbar";
import TeacherTopNavbar from "./TeacherTopNavbar";

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check both sessionStorage and localStorage for user groups
    const groupsStr = sessionStorage.getItem("groups") ?? localStorage.getItem("groups");
    
    if (groupsStr) {
      try {
        const groups = JSON.parse(groupsStr) as string[];
        // Determine role from groups (student or teacher)
        if (groups.includes("student")) {
          setUserRole("student");
        } else if (groups.includes("teacher")) {
          setUserRole("teacher");
        } else {
          setUserRole(null);
        }
      } catch {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    
    setIsLoading(false);
  }, []);

  // Prevent flash of wrong navbar during loading
  if (isLoading) {
    return null;
  }

  // Render appropriate navbar based on user role
  if (userRole === "student") {
    return <StudentNavbar />;
  } else if (userRole === "teacher") {
    return <TeacherTopNavbar />;
  } else {
    return <PublicNavbar />;
  }
}
