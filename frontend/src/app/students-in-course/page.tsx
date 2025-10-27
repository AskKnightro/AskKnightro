"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./students-in-course.module.css";

export const dynamic = "force-dynamic";

type StudentDto = {
  studentId: number;
  name: string;
  email: string;
  profilePicture?: string | null;
  yearStanding?: string | null;
  major?: string | null;
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
}

export default function PageShell() {
  return (
      <>
        <Navbar />
        <TeacherNavbar />
        <Suspense
            fallback={
              <div className={styles.pageContainer}>
                <main className={styles.mainContent}>
                  <div className={styles.headerSection}>
                    <h1 className={styles.pageTitle}>Students in Course</h1>
                    <p className={styles.pageSubtitle}>Loading…</p>
                  </div>
                </main>
              </div>
            }
        >
          <StudentsInCourseContent />
        </Suspense>
        <Footer />
      </>
  );
}

function StudentsInCourseContent() {
  const params = useSearchParams();

  // read both, like your teacher dashboard does
  const teacherId = useMemo(() => {
    const q = params?.get("teacherId");
    return q ? parseInt(q, 10) : 1; // default for dev
  }, [params]);

  const courseId = useMemo(() => {
    const q = params?.get("course");
    return q ? parseInt(q, 10) : undefined;
  }, [params]);

  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected] = useState<StudentDto | null>(null);
  const [sideLoading, setSideLoading] = useState(false);
  const [sideError, setSideError] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  // fetch list
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      setStudents([]);
      setSelected(null);
      setErrorMsg("No course selected.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetch(`http://localhost:8080/api/enrollments/${courseId}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load students (${res.status}): ${text || res.statusText}`);
        }
        const list: StudentDto[] = await res.json();
        if (cancelled) return;

        setStudents(list);
        setSelected(list.length ? list[0] : null);
      } catch (err: unknown) {
        if (!cancelled) {
          setStudents([]);
          setSelected(null);
          setErrorMsg(getErrorMessage(err) || "Unable to load students.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [courseId]);

  const onSelect = async (studentId: number, fallback?: StudentDto) => {
    if (!courseId) return;
    setSideLoading(true);
    setSideError("");
    try {
      const res = await fetch(
          `http://localhost:8080/api/enrollments/${courseId}/students/${studentId}`,
          { headers: { "Content-Type": "application/json" }, cache: "no-store" }
      );
      if (!res.ok) {
        const text = await res.text();
        if (fallback) setSelected(fallback);
        else throw new Error(text || res.statusText);
      } else {
        const dto: StudentDto = await res.json();
        setSelected(dto);
      }
    } catch (err: unknown) {
      setSideError(getErrorMessage(err) || "Unable to load student.");
    } finally {
      setSideLoading(false);
    }
  };

  const onRemove = async (studentId: number) => {
    if (!courseId) return;
    const student = students.find((s) => s.studentId === studentId);
    const name = student?.name || `#${studentId}`;
    if (!confirm(`Remove ${name} from this course?`)) return;

    const prev = students;
    setRemovingId(studentId);
    setStudents((list) => list.filter((s) => s.studentId !== studentId));
    if (selected?.studentId === studentId) setSelected(null);

    try {
      const res = await fetch(
          `http://localhost:8080/api/enrollments/${courseId}/students/${studentId}`,
          { method: "DELETE" }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
    } catch (err: unknown) {
      setStudents(prev); // rollback
      alert(getErrorMessage(err) || "Failed to remove student.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Students in Course</h1>
            <p className={styles.pageSubtitle}>
              View and manage students enrolled in your course
            </p>
          </div>

          <div className={styles.contentSection}>
            {/* Enrolled Students */}
            <div className={styles.studentsCard}>
              <h2 className={styles.sectionTitle}>
                Enrolled Students {loading ? "(Loading…)" : `(${students.length})`}
              </h2>

              {errorMsg ? (
                  <p className={styles.placeholder} style={{ color: "#b00020" }}>{errorMsg}</p>
              ) : students.length === 0 && !loading ? (
                  <p className={styles.placeholder}>No students enrolled yet.</p>
              ) : (
                  <ul className={styles.studentsList} role="listbox" aria-label="Enrolled students">
                    {students.map((s) => {
                      const active = s.studentId === selected?.studentId;
                      const isRemoving = removingId === s.studentId;
                      return (
                          <li
                              key={s.studentId}
                              role="option"
                              aria-selected={active}
                              className={`${styles.studentItem} ${active ? styles.studentItemActive : ""}`}
                              tabIndex={0}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest("button")) return;
                                onSelect(s.studentId, s);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onSelect(s.studentId, s);
                              }}
                          >
                            <div className={styles.studentRow}>
                              <div className={styles.studentMain}>
                                <div className={styles.studentName}>{s.name}</div>
                                <div className={styles.studentMeta}>
                                  <span>{s.email}</span>
                                  <span>• {s.yearStanding || "—"}</span>
                                  <span>• {s.major || "—"}</span>
                                </div>
                              </div>
                              <div className={styles.studentActions}>
                                <button
                                    className={styles.removeBtn}
                                    onClick={() => onRemove(s.studentId)}
                                    disabled={isRemoving}
                                    title="Remove"
                                    type="button"
                                >
                                  {isRemoving ? "Removing…" : "Remove"}
                                </button>
                              </div>
                            </div>
                          </li>
                      );
                    })}
                  </ul>
              )}
            </div>

            {/* Manage Members */}
            <div className={styles.studentsCard}>
              <h2 className={styles.sectionTitle}>Manage Members</h2>

              {sideLoading && <p className={styles.placeholder}>Loading…</p>}
              {sideError && <p className={styles.placeholder} style={{ color: "#b00020" }}>{sideError}</p>}
              {!sideLoading && !sideError && !selected && (
                  <p className={styles.placeholder}>Select a student to view details.</p>
              )}

              {!sideLoading && !sideError && selected && (
                  <div className={styles.detailCard}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Name:</span>
                      <span>{selected.name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span>{selected.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Year:</span>
                      <span>{selected.yearStanding || "—"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Major:</span>
                      <span>{selected.major || "—"}</span>
                    </div>

                    <div className={styles.detailActions}>
                      <button
                          className={styles.removeBtn}
                          onClick={() => onRemove(selected.studentId)}
                          disabled={removingId === selected.studentId}
                          type="button"
                      >
                        {removingId === selected.studentId ? "Removing…" : "Remove from class"}
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>

          <div className={styles.backLinkContainer}>
            <Link
                href={`/teacher-course-dashboard?course=${courseId ?? ""}&teacherId=${teacherId}`}
                className={styles.backLink}
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
  );
}