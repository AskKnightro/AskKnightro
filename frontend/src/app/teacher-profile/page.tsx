"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Cookie + JWT utilities (resilient, no external deps)
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}
function decodeJwtPayload<T = unknown>(jwt?: string): T | undefined {
  if (!jwt) return undefined;
  try {
    const parts = jwt.split(".");
    if (parts.length < 2) return undefined;
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payloadB64.length % 4;
    const padded = pad ? payloadB64 + "=".repeat(4 - pad) : payloadB64;
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

// --- move search-params / CSR logic into Inner ---
function Inner() {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams?.get("id") ?? undefined;

  // Try token if query param absent
  const idToken = typeof document !== "undefined" ? getCookie("idToken") : undefined;
  const tokenPayload = useMemo(() => decodeJwtPayload<Record<string, unknown> | undefined>(idToken), [idToken]);

  const resolvedId = useMemo<number | undefined>(() => {
    if (idFromQuery) {
      const n = Number(idFromQuery);
      return Number.isFinite(n) ? n : undefined;
    }
    // try common claim names
    const claim = tokenPayload?.["teacher_id"] ?? tokenPayload?.["custom:teacher_id"] ?? tokenPayload?.["sub"];
    if (typeof claim === "number") return claim;
    if (typeof claim === "string") {
      const n = Number(claim);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  }, [idFromQuery, tokenPayload]);

  const [orig, setOrig] = useState<TeacherDto | null>(null);
  const [draft, setDraft] = useState<TeacherDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!resolvedId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setSaved(false);
      try {
        const data = await getJson<TeacherDto>(`/api/users/teachers/${resolvedId}`);
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
  }, [resolvedId]);

  const onChange = useCallback(<K extends keyof TeacherDto>(key: K, value: TeacherDto[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }, []);

  const onCancel = useCallback(() => {
    setDraft(orig);
    setError(null);
    setSaved(false);
  }, [orig]);

  const onSave = useCallback(async () => {
    if (!draft || !resolvedId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: TeacherDto = {
        teacherId: resolvedId,
        name: (draft.name ?? "").trim() || null,
        email: draft.email ?? null, // read-only
        department: (draft.department ?? "").trim() || null,
        profilePicture: (draft.profilePicture ?? "").trim() || null,
        password: null,
        bio: (draft.bio ?? "").trim() || null,
      };
      const updated = await putJson<TeacherDto>(`/api/users/teachers/${resolvedId}`, body);
      const normalized: TeacherDto = {
        teacherId: updated.teacherId ?? resolvedId,
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to save profile";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [draft, resolvedId]);

  // Render
  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.studentName}>Teacher Profile</h1>
            </div>

            {!resolvedId && (
              <div className={styles.errorBox}>
                Missing teacher id. <Link href="/">Return home</Link>.
              </div>
            )}

            {loading && <div className={styles.loading}>Loading…</div>}

            {error && <div className={styles.errorBox}>{error}</div>}
            {saved && <div className={styles.successBox}>Profile updated.</div>}

            {draft && resolvedId && (
              <form
                className={styles.infoGrid}
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave();
                }}
              >
                <div className={styles.infoField}>
                  <label htmlFor="name" className={styles.fieldLabel}>Name</label>
                  <input
                    id="name"
                    className={styles.editInput}
                    type="text"
                    value={draft.name ?? ""}
                    onChange={(e) => onChange("name", e.target.value)}
                  />
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="email" className={styles.fieldLabel}>Email</label>
                  <input
                    id="email"
                    className={styles.editInput}
                    type="email"
                    value={draft.email ?? ""}
                    readOnly
                  />
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="department" className={styles.fieldLabel}>Department</label>
                  <input
                    id="department"
                    className={styles.editInput}
                    type="text"
                    value={draft.department ?? ""}
                    onChange={(e) => onChange("department", e.target.value)}
                  />
                </div>

                <div className={styles.infoField}>
                  <label htmlFor="profilePicture" className={styles.fieldLabel}>Profile Picture (URL)</label>
                  <input
                    id="profilePicture"
                    className={styles.editInput}
                    type="text"
                    value={draft.profilePicture ?? ""}
                    onChange={(e) => onChange("profilePicture", e.target.value)}
                  />
                </div>

                {(draft.profilePicture ?? "").trim() !== "" && (
                  <div className={styles.infoField}>
                    <label className={styles.fieldLabel}>Preview</label>
                    <div className={styles.preview}>
                      {/* Basic preview; keep it simple to avoid Next.js Image layout friction */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className={styles.avatar} src={String(draft.profilePicture)} alt="Profile preview" />
                    </div>
                  </div>
                )}

                <div className={styles.infoField}>
                  <label htmlFor="bio" className={styles.fieldLabel}>Bio</label>
                  <textarea
                    id="bio"
                    className={styles.editTextarea}
                    rows={6}
                    value={draft.bio ?? ""}
                    onChange={(e) => onChange("bio", e.target.value)}
                  />
                </div>

                <div className={styles.infoField}>
                  <div className={styles.editActions}>
                    <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
                    <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
                  </div>
                </div>
              </form>
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
