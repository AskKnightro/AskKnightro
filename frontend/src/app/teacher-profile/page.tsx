"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import styles from "./teacher-profile.module.css";

type TeacherDto = {
  teacherId: number | null;
  name: string | null;
  email: string | null;
  department: string | null;
  profilePicture: string | null;
  password: string | null;
  bio: string | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { 
    credentials: "include", 
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- move search-params / CSR logic into Inner ---
function Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromQuery = searchParams?.get("id") ?? undefined;

  // Load teacher ID from sessionStorage first, then fall back to URL param
  const [teacherId, setTeacherId] = useState<number | null>(null);

  useEffect(() => {
    // Try sessionStorage/localStorage first
    const storedId = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
    if (storedId) {
      setTeacherId(parseInt(storedId, 10));
    } else if (idFromQuery) {
      // Fall back to URL param
      const n = Number(idFromQuery);
      if (Number.isFinite(n)) {
        setTeacherId(n);
      }
    }
  }, [idFromQuery]);

  const [isEditing, setIsEditing] = useState(false);
  const [orig, setOrig] = useState<TeacherDto | null>(null);
  const [draft, setDraft] = useState<TeacherDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setSaved(false);
      try {
        const data = await getJson<TeacherDto>(`/api/users/teachers/${teacherId}`);
        if (cancelled) return;
        const normalized: TeacherDto = {
          teacherId: data.teacherId ?? null,
          name: data.name ?? "",
          email: data.email ?? "",
          department: data.department ?? "",
          profilePicture: data.profilePicture ?? "",
          password: null,
          bio: data.bio ?? "",
        };
        setOrig(normalized);
        setDraft(normalized);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to load teacher profile";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const onChange = useCallback(<K extends keyof TeacherDto>(key: K, value: TeacherDto[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }, []);

  const onCancel = useCallback(() => {
    setIsEditing(false);
    setDraft(orig);
    setError(null);
    setSaved(false);
  }, [orig]);

  const onEdit = useCallback(() => {
    setIsEditing(true);
    setSaved(false);
  }, []);

  const onSave = useCallback(async () => {
    if (!draft || !teacherId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: TeacherDto = {
        teacherId: teacherId,
        name: (draft.name ?? "").trim() || null,
        email: draft.email ?? null, // read-only
        department: (draft.department ?? "").trim() || null,
        profilePicture: (draft.profilePicture ?? "").trim() || null,
        password: null,
        bio: (draft.bio ?? "").trim() || null,
      };
      const updated = await putJson<TeacherDto>(`/api/users/teachers/${teacherId}`, body);
      const normalized: TeacherDto = {
        teacherId: updated.teacherId ?? teacherId,
        name: updated.name ?? "",
        email: updated.email ?? "",
        department: updated.department ?? "",
        profilePicture: updated.profilePicture ?? "",
        password: null,
        bio: updated.bio ?? "",
      };
      setOrig(normalized);
      setDraft(normalized);
      setSaved(true);
      setIsEditing(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to save profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [draft, teacherId]);

  const handleLogout = () => {
    // Clear all stored authentication data
    sessionStorage.clear();
    localStorage.removeItem("ak_access");
    localStorage.removeItem("ak_id");
    localStorage.removeItem("ak_sub");
    localStorage.removeItem("ak_refresh");
    localStorage.removeItem("userId");
    localStorage.removeItem("groups");
    
    // Redirect to login
    router.push("/login");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.pageContainer}>
          <main className={styles.mainContent}>
            <p>Loading…</p>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // Render
  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {error && <div className={styles.errorBox}>{error}</div>}
          {saved && <div className={styles.successBox}>Profile updated.</div>}
          
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.studentName}>{draft?.name || "Teacher Profile"}</h1>
              <div className={styles.editButtonContainer}>
                {!isEditing ? (
                  <>
                    <Button label="Edit Profile" onClick={onEdit} />
                    <button onClick={handleLogout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className={styles.editActions}>
                    <Button label={saving ? "Saving…" : "Save"} onClick={onSave} />
                    <button onClick={onCancel} className={styles.cancelButton} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!teacherId && (
              <div className={styles.errorBox}>
                Missing teacher id. <Link href="/">Return home</Link>.
              </div>
            )}

            {draft && teacherId && (
              <div className={styles.infoGrid}>
                <div className={styles.infoField}>
                  <label htmlFor="name" className={styles.fieldLabel}>Name</label>
                  {isEditing ? (
                    <input
                      id="name"
                      className={styles.editInput}
                      type="text"
                      value={draft.name ?? ""}
                      onChange={(e) => onChange("name", e.target.value)}
                    />
                  ) : (
                    <span className={styles.fieldValue}>{draft.name}</span>
                  )}
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="email" className={styles.fieldLabel}>Email</label>
                  <span className={styles.fieldValue}>{draft.email}</span>
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="department" className={styles.fieldLabel}>Department</label>
                  {isEditing ? (
                    <input
                      id="department"
                      className={styles.editInput}
                      type="text"
                      value={draft.department ?? ""}
                      onChange={(e) => onChange("department", e.target.value)}
                    />
                  ) : (
                    <span className={styles.fieldValue}>{draft.department}</span>
                  )}
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="profilePicture" className={styles.fieldLabel}>Profile Picture (URL)</label>
                  {isEditing ? (
                    <input
                      id="profilePicture"
                      className={styles.editInput}
                      type="text"
                      value={draft.profilePicture ?? ""}
                      onChange={(e) => onChange("profilePicture", e.target.value)}
                    />
                  ) : (
                    <span className={styles.fieldValue}>{draft.profilePicture}</span>
                  )}
                </div>

                {(draft.profilePicture ?? "").trim() !== "" && (
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Preview</label>
                    <div className={styles.preview}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className={styles.avatar} src={String(draft.profilePicture)} alt="Profile preview" />
                    </div>
                  </div>
                )}

                <div className={styles.infoField} style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="bio" className={styles.fieldLabel}>Bio</label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      className={styles.editTextarea}
                      rows={6}
                      value={draft.bio ?? ""}
                      onChange={(e) => onChange("bio", e.target.value)}
                    />
                  ) : (
                    <span className={styles.fieldValue}>{draft.bio}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

// wrapper export: Suspense around Inner to satisfy Next.js requirement
export default function TeacherProfilePage() {
  return (
    <Suspense fallback={<div className={styles.pageContainer}><div className={styles.mainContent}><p>Loading…</p></div></div>}>
      <Inner />
    </Suspense>
  );
}
