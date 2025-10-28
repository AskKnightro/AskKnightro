"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TeacherTopNavbar from "../components/TeacherTopNavbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Link from "next/link";
import styles from "./create-course.module.css";

export const dynamic = "force-dynamic"; // disable prerendering for this route

type ChosenFile = {
  id: string;
  name: string;
  file: File;
};

type CourseDto = {
  classId: number;
  enrollmentCode: string;
  courseName: string;
  semester: string;
  teacherId: number | null;
  courseDescription: string | null;
  shardId: string | null;
};

const API_BASE = "http://localhost:8080";

export default function CreateCoursePage() {
  const router = useRouter();

  const [teacherId, setTeacherId] = useState<number | undefined>(undefined);
  const [courseName, setCourseName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [termSemester, setTermSemester] = useState("");

  // Load teacherId from storage on client side only
  useEffect(() => {
    const id = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
    if (id) {
      setTeacherId(parseInt(id, 10));
    }
  }, []);

  const [chosenFiles, setChosenFiles] = useState<ChosenFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>("");

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const next: ChosenFile[] = [];
    Array.from(files).forEach((f) => {
      // MVP restriction: .txt only (backend accepts that per your controller)
      if (!f.name.toLowerCase().endsWith(".txt")) return;
      next.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: f.name,
        file: f,
      });
    });

    setChosenFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setChosenFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clickPick = () => fileInputRef.current?.click();

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  async function createCourse(): Promise<CourseDto> {
    const payload = {
      courseName: courseName.trim(),
      semester: termSemester.trim(),
      courseDescription: classDescription.trim() || null,
      teacherId: teacherId ?? null,
      shardId: null as string | null,
      // If blank, backend generates enrollmentCode
      enrollmentCode: classCode.trim() || undefined,
    };

    const res = await fetch(`${API_BASE}/api/users/courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
          `Create course failed (${res.status}): ${text || res.statusText}`
      );
    }
    return res.json();
  }

  async function uploadOneMaterial(classId: number, cf: ChosenFile) {
    const form = new FormData();
    form.append("classId", String(classId));
    form.append("file", cf.file, cf.name);
    form.append("name", cf.name);

    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/materials`, {
      method: "POST",
      headers,
      body: form, // let browser set multipart boundary
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
          `Upload "${cf.name}" failed (${res.status}): ${text || res.statusText}`
      );
    }
  }

  const handleCreateCourse = async () => {
    try {
      if (!teacherId) {
        alert(
            "Missing teacherId. Please log in again."
        );
        return;
      }
      if (!courseName.trim() || !termSemester.trim()) {
        alert("Please provide Course Name and Term/Semester.");
        return;
      }

      setSubmitting(true);
      setProgressMsg("Creating course…");

      // 1) Create course in RDS
      const created = await createCourse();
      const classId = created.classId;

      // 2) Upload each file to embed into Milvus
      for (let i = 0; i < chosenFiles.length; i++) {
        const cf = chosenFiles[i];
        setProgressMsg(`Embedding ${i + 1}/${chosenFiles.length}: ${cf.name}`);
        await uploadOneMaterial(classId, cf);
      }

      setProgressMsg("Done! Redirecting…");

      // 3) Go to the teacher course dashboard
      router.push(`/teacher-course-dashboard?course=${classId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create course.";
      console.error(err);
      alert(msg);
      setProgressMsg("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <>
        <TeacherTopNavbar />
        <div className={styles.pageContainer}>
          <main className={styles.mainContent}>
          <div className={styles.contentGrid}>
            {/* Left Column - Form */}
            <div className={styles.leftColumn}>
              <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Enter course information</h2>

                <div className={styles.inputGroup}>
                  <label htmlFor="courseName" className={styles.label}>
                    Course Name
                  </label>
                  <input
                      type="text"
                      id="courseName"
                      className={styles.input}
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="Enter course name"
                      disabled={submitting}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="classCode" className={styles.label}>
                    Class Code (optional)
                  </label>
                  <input
                      type="text"
                      id="classCode"
                      className={styles.input}
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="Enter class/enrollment code"
                      disabled={submitting}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="classDescription" className={styles.label}>
                    Class Description
                  </label>
                  <input
                      type="text"
                      id="classDescription"
                      className={styles.input}
                      value={classDescription}
                      onChange={(e) => setClassDescription(e.target.value)}
                      placeholder="Enter class description"
                      disabled={submitting}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="termSemester" className={styles.label}>
                    Term/Semester
                  </label>
                  <input
                      type="text"
                      id="termSemester"
                      className={styles.input}
                      value={termSemester}
                      onChange={(e) => setTermSemester(e.target.value)}
                      placeholder="Enter term/semester"
                      disabled={submitting}
                  />
                </div>

                {/* File Upload */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Upload Documents</label>
                  <div className={styles.uploadArea} onClick={clickPick}>
                    <div className={styles.uploadIcon}>☁️↑</div>
                    <span className={styles.uploadText}>Click to upload files</span>
                  </div>
                  <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      multiple
                      onChange={handleFilePick}
                      className={styles.hiddenInput}
                      disabled={submitting}
                  />
                  <p className={styles.fileRestriction}>Only .txt files are allowed</p>
                </div>

                <div className={styles.buttonContainer}>
                  <Button
                      label={submitting ? "Working…" : "Create Course"}
                      onClick={handleCreateCourse}
                  />
                </div>

                {!!progressMsg && (
                    <p style={{ marginTop: 10, fontWeight: 600 }}>{progressMsg}</p>
                )}
              </section>

              {/* Selected Documents */}
              <section className={styles.documentsSection}>
                <h2 className={styles.sectionTitle}>Selected Documents</h2>
                {chosenFiles.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>No files selected yet.</p>
                ) : (
                    <div className={styles.filesList}>
                      {chosenFiles.map((f) => (
                          <div key={f.id} className={styles.fileItem}>
                            <button
                                className={styles.removeButton}
                                onClick={() => removeFile(f.id)}
                                aria-label={`Remove ${f.name}`}
                                disabled={submitting}
                            >
                              ✕
                            </button>
                            <span className={styles.fileName}>{f.name}</span>
                          </div>
                      ))}
                    </div>
                )}
              </section>
            </div>

            {/* Right Column - Info */}
            <div className={styles.rightColumn}>
              <h1 className={styles.mainTitle}>Create a New Course</h1>

              <div className={styles.infoContent}>
                <p className={styles.infoParagraph}>
                  Set up a new course and build a custom AI Teaching Assistant that supports your
                  students using your course materials.
                </p>
                <p className={styles.infoParagraph}>
                  Your AI Assistant will use these documents to provide context-aware support.
                  (MVP supports TXT uploads.)
                </p>
                <p className={styles.infoParagraph}>
                  After creating, we’ll embed your documents into the vector store so your assistant
                  can reference them immediately.
                </p>
                <ul className={styles.featuresList}>
                  <li>Preview how it answers student questions</li>
                  <li>Add or remove documents at any time</li>
                  <li>Monitor student activity and questions</li>
                </ul>
                <p className={styles.ctaParagraph}>
                  Ready to launch? Click <strong className={styles.createLink}>Create Course</strong>.
                </p>

                <div className={styles.backLinkContainer} style={{ marginTop: 24 }}>
                  <Link href="/" className={styles.backLink}>
                    Back to Main Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}