"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import styles from "./student-profile.module.css";

type CourseDto = {
  classId?: number;
  courseName?: string | null;
  courseCode?: string | null;
  description?: string | null;
  teacherId?: number | null;
  [key: string]: unknown;
};

interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string; // read-only
  major: string;
  year: string; // maps to yearStanding
  gradDate: string; // "YYYY-MM-DD"
  schoolId: string;
  universityCollege: string;
  profilePicture: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  gpa: string;
  password?: string; // write-only (optional)
  confirmPassword?: string; // client-only
}

type StudentDto = {
  studentId?: number | null;
  name?: string | null;
  email?: string | null;
  profilePicture?: string | null;
  yearStanding?: string | null;
  major?: string | null;
  gradDate?: string | null;
  schoolId?: string | null;
  universityCollege?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  gpa?: number | string | null;
  password?: string | null;
  [key: string]: unknown;
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

// simple fetch helpers
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function putJson<TBody extends object, TResp>(path: string, body: TBody): Promise<TResp> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `PUT ${path} -> ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<TResp>;
}

// map server DTO -> UI model
const dtoToInfo = (d: StudentDto): StudentInfo => {
  const [first, last] = (d.name ?? "").trim().split(" ", 2);
  return {
    firstName: first ?? "",
    lastName: last ?? "",
    email: d.email ?? "",
    studentId: d.studentId != null ? String(d.studentId) : "",
    major: d.major ?? "",
    year: d.yearStanding ?? "",
    gradDate: d.gradDate ? String(d.gradDate).slice(0, 10) : "",
    schoolId: d.schoolId ?? "",
    universityCollege: d.universityCollege ?? "",
    profilePicture: d.profilePicture ?? "",
    phone: d.phone ?? "",
    address: d.address ?? "",
    emergencyContact: d.emergencyContact ?? "",
    emergencyPhone: d.emergencyPhone ?? "",
    gpa: d.gpa != null ? String(d.gpa) : "",
    password: "",
    confirmPassword: "",
  };
};

// map UI model -> server DTO (omit empty strings -> null for optional fields)
const infoToDto = (i: StudentInfo): StudentDto => {
  const dto: StudentDto = {
    studentId: i.studentId ? Number(i.studentId) : null,
    name: `${i.firstName} ${i.lastName}`.trim() || null,
    email: i.email || null,
    profilePicture: i.profilePicture || null,
    yearStanding: i.year || null,
    major: i.major || null,
    gradDate: i.gradDate || null,
    schoolId: i.schoolId || null,
    universityCollege: i.universityCollege || null,
    phone: i.phone || null,
    address: i.address || null,
    emergencyContact: i.emergencyContact || null,
    emergencyPhone: i.emergencyPhone || null,
    gpa: i.gpa ? (isNaN(Number(i.gpa)) ? i.gpa : Number(i.gpa)) : null,
  };
  if (i.password && i.password.trim().length > 0) {
    dto.password = i.password.trim();
  }
  return dto;
};

function Inner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentIdFromQuery = searchParams.get("id");

  // Load student ID from sessionStorage first, then fall back to URL param
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Try sessionStorage/localStorage first
    const storedId = sessionStorage.getItem("userId") ?? localStorage.getItem("userId");
    if (storedId) {
      setStudentId(storedId);
    } else if (studentIdFromQuery) {
      setStudentId(studentIdFromQuery);
    }
  }, [studentIdFromQuery]);

  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState<StudentInfo>({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    major: "",
    year: "",
    gradDate: "",
    schoolId: "",
    universityCollege: "",
    profilePicture: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    gpa: "",
    password: "",
    confirmPassword: "",
  });
  const [originalStudent, setOriginalStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseDto[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!studentId) {
        setError("Missing student id");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const dto = await getJson<StudentDto>(`/api/users/students/${studentId}`);
        if (!alive) return;
        const info = dtoToInfo(dto);
        setStudent(info);
        setOriginalStudent(info);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [studentId]);

  // Fetch enrolled courses
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!studentId) return;
      try {
        setLoadingCourses(true);
        const courses = await getJson<CourseDto[]>(`/api/users/courses/user/${studentId}?role=STUDENT`);
        if (!alive) return;
        setEnrolledCourses(courses);
      } catch (err: unknown) {
        console.error("Failed to load courses:", err);
        // Don't set error state, just log it - courses are optional
      } finally {
        if (alive) setLoadingCourses(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [studentId]);

  const handleInputChange = (field: keyof StudentInfo, value: string) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (originalStudent) setStudent(originalStudent);
    router.refresh();
  };

  const handleSave = async () => {
    // validate password confirm if provided
    if ((student.password || student.confirmPassword) && student.password !== student.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const id = student.studentId ? Number(student.studentId) : Number(studentId);
      const payload = infoToDto(student);
      const updatedDto = await putJson<StudentDto, StudentDto>(`/api/users/students/${id}`, payload);
      const updatedInfo = dtoToInfo(updatedDto);
      // clear passwords after save
      updatedInfo.password = "";
      updatedInfo.confirmPassword = "";
      setStudent(updatedInfo);
      setOriginalStudent(updatedInfo);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const fullName = useMemo(() => `${student.firstName} ${student.lastName}`.trim() || "Student", [student.firstName, student.lastName]);

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

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <h1 className={styles.studentName}>{fullName}</h1>
              <div className={styles.editButtonContainer}>
                {!isEditing ? (
                  <>
                    <Button label="Edit Profile" onClick={handleEdit} />
                    <button onClick={handleLogout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className={styles.editActions}>
                    <Button label={saving ? "Saving…" : "Save"} onClick={handleSave} />
                    <button onClick={handleCancel} className={styles.cancelButton} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>First Name</label>
                {isEditing ? (
                  <input type="text" value={student.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.firstName}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Last Name</label>
                {isEditing ? (
                  <input type="text" value={student.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.lastName}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Student ID</label>
                <span className={styles.fieldValue}>{student.studentId}</span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Email</label>
                <span className={styles.fieldValue}>{student.email}</span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Phone</label>
                {isEditing ? (
                  <input type="tel" value={student.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.phone}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Major</label>
                {isEditing ? (
                  <input type="text" value={student.major} onChange={(e) => handleInputChange("major", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.major}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Year</label>
                {isEditing ? (
                  <select value={student.year} onChange={(e) => handleInputChange("year", e.target.value)} className={styles.editSelect}>
                    <option value="">Select...</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                ) : (
                  <span className={styles.fieldValue}>{student.year}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>GPA</label>
                <span className={styles.fieldValue}>{student.gpa}</span>
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Address</label>
                {isEditing ? (
                  <input type="text" value={student.address} onChange={(e) => handleInputChange("address", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.address}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Emergency Contact</label>
                {isEditing ? (
                  <input type="text" value={student.emergencyContact} onChange={(e) => handleInputChange("emergencyContact", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.emergencyContact}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Emergency Phone</label>
                {isEditing ? (
                  <input type="tel" value={student.emergencyPhone} onChange={(e) => handleInputChange("emergencyPhone", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.emergencyPhone}</span>
                )}
              </div>

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Profile Picture</label>
                {isEditing ? (
                  <input type="text" value={student.profilePicture} onChange={(e) => handleInputChange("profilePicture", e.target.value)} className={styles.editInput} />
                ) : (
                  <span className={styles.fieldValue}>{student.profilePicture}</span>
                )}
              </div>

              {!!student.profilePicture && (
                <div className={styles.infoField}>
                  <label className={styles.fieldLabel}>Picture Preview</label>
                  <div className={styles.preview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={student.profilePicture} alt="Profile preview" className={styles.avatar} />
                  </div>
                </div>
              )}

              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>Enrolled Courses</label>
                {loadingCourses ? (
                  <span className={styles.fieldValue}>Loading courses...</span>
                ) : enrolledCourses.length > 0 ? (
                  <div className={styles.coursesList}>
                    {enrolledCourses.map((c) => (
                      <div key={c.classId} className={styles.courseItem}>
                        <span className={styles.courseCode}>{c.courseCode || "N/A"}</span> - {c.courseName || "Unnamed Course"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className={styles.fieldValue}>No courses enrolled</span>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

// wrapper export: Suspense around Inner to satisfy Next.js requirement
export default function StudentProfilePage() {
  return (
    <Suspense fallback={<div className={styles.pageContainer}><div className={styles.mainContent}><p>Loading…</p></div></div>}>
      <Inner />
    </Suspense>
  );
}
