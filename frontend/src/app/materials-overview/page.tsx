"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TeacherTopNavbar from "../components/TeacherTopNavbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./materials-overview.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface CourseMaterial {
  id: number;
  classId: number;
  name: string;
  vectorId: string | null;
  isDeleted: boolean | null;
  deletedAt: string | null;
}

const MaterialsOverviewContent: React.FC = () => {
  const searchParams = useSearchParams();
  const courseId = useMemo(() => {
    const courseIdParam = searchParams.get("courseId");
    return courseIdParam ? parseInt(courseIdParam, 10) : null;
  }, [searchParams]);

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string>("");

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (!courseId) {
      setError("No course ID provided");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load course info
        const courseRes = await fetch(`${API_BASE}/api/users/courses/${courseId}`, {
          headers: getAuthHeaders(),
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.courseName);
        }

        // Load materials
        const materialsRes = await fetch(`${API_BASE}/api/materials?classId=${courseId}`, {
          headers: getAuthHeaders(),
        });
        if (!materialsRes.ok) {
          throw new Error(`Failed to load materials: ${materialsRes.statusText}`);
        }

        const materialsData: CourseMaterial[] = await materialsRes.json();
        setMaterials(materialsData);
      } catch (err) {
        console.error("Failed to load materials:", err);
        setError(err instanceof Error ? err.message : "Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);


  return (
    <>
      <TeacherTopNavbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Materials Overview</h1>
            <p className={styles.pageSubtitle}>
              {courseName || "Manage course materials, uploads, and resources"}
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>Error: {error}</p>
            </div>
          )}

          {loading && (
            <div className={styles.loadingMessage}>
              <p>Loading materials...</p>
            </div>
          )}

          {!loading && !error && (
            <div className={styles.contentSection}>
              <div className={styles.materialsCard}>
                <h2 className={styles.sectionTitle}>
                  Course Documents ({materials.length})
                </h2>

                {materials.length === 0 ? (
                  <p className={styles.placeholder}>
                    No materials uploaded yet. Use the &quot;Edit Course&quot; page to upload materials.
                  </p>
                ) : (
                  <div className={styles.materialsGrid}>
                    {materials
                      .filter((material) => !material.isDeleted)
                      .map((material) => (
                        <div key={material.id} className={styles.materialCard}>
                          <div className={styles.materialIcon}>
                            📄
                          </div>
                          <div className={styles.materialInfo}>
                            <h3 className={styles.materialName}>{material.name}</h3>
                            <div className={styles.materialMeta}>
                              <span className={styles.metaItem}>
                                ID: {material.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>💡 Upload Materials</h3>
                <p className={styles.infoText}>
                  To upload new materials, go to the &quot;Edit Course&quot; page from the Teacher Navbar
                  and use the file upload section.
                </p>
              </div>
            </div>
          )}

          <div className={styles.backLinkContainer}>
            <Link
              href={`/teacher-course-dashboard?course=${courseId}`}
              className={styles.backLink}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

const MaterialsOverviewPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading materials...
        </div>
      }
    >
      <MaterialsOverviewContent />
    </Suspense>
  );
};

export default MaterialsOverviewPage;
