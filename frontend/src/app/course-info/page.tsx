"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TeacherTopNavbar from "../components/TeacherTopNavbar";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import Link from "next/link";
import styles from "./course-info.module.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

interface CourseMaterial {
  id: number;
  classId: number;
  name: string;
  filename: string;
  s3Key: string;
  uploadedAt: string;
  size?: string;
}

const CourseInfoContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>("");
  const [replacingFileId, setReplacingFileId] = useState<number | null>(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

  const [courseData, setCourseData] = useState<{
    classId: number | null;
    enrollmentCode: string;
    courseName: string;
    semester: string;
    courseDescription: string;
  }>({
    classId: null,
    enrollmentCode: "",
    courseName: "",
    semester: "",
    courseDescription: "",
  });

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Helper for multipart requests (don't set Content-Type, let browser set boundary)
  const getAuthHeadersMultipart = () => {
    const token = sessionStorage.getItem("ak_access") ?? localStorage.getItem("ak_access");
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  // Load course data on component mount
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get courseId from URL params
        const courseIdParam = searchParams.get("courseId");
        if (!courseIdParam) {
          setError("Course ID is missing from URL");
          setLoading(false);
          return;
        }

        const id = parseInt(courseIdParam, 10);
        if (isNaN(id)) {
          setError("Invalid course ID in URL");
          setLoading(false);
          return;
        }

        setCourseId(id);

        const response = await fetch(`${API_BASE}/api/users/courses/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
          // credentials: "include", // uncomment if your API uses cookies
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received course data from API:", data);

        setCourseData({
          classId: data.classId ?? null,
          enrollmentCode: data.enrollmentCode ?? "",
          courseName: data.courseName ?? "",
          semester: data.semester ?? "",
          courseDescription: data.courseDescription ?? "",
        });

        // Load course materials after loading course data
        if (data.classId) {
          await loadCourseMaterials(data.classId);
        }
      } catch (err) {
        console.error("Failed to load course data:", err);
        setError(
          `Failed to load course data: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [uploadedFiles, setUploadedFiles] = useState<CourseMaterial[]>([]);

  // Load course materials
  const loadCourseMaterials = async (classId: number) => {
    try {
      setMaterialsLoading(true);
      const response = await fetch(
        `${API_BASE}/api/materials?classId=${classId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch materials: ${response.statusText}`);
      }

      const materials: CourseMaterial[] = await response.json();
      setUploadedFiles(materials);
    } catch (err) {
      console.error("Failed to load course materials:", err);
      setError(
        `Failed to load course materials: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!courseId) {
      setError("Course ID is missing");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const coursePayload = {
        classId: courseData.classId,
        enrollmentCode: courseData.enrollmentCode,
        courseName: courseData.courseName,
        semester: courseData.semester,
        courseDescription: courseData.courseDescription,
      };

      console.log("Sending course update:", coursePayload);

      const response = await fetch(
        `${API_BASE}/api/users/courses/list/${courseId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(coursePayload),
          // credentials: "include", // uncomment if your API uses cookies
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update course: ${response.statusText}`);
      }

      const updatedCourse = await response.json();
      console.log("Received updated course:", updatedCourse);

      setCourseData({
        classId: updatedCourse.classId ?? null,
        enrollmentCode: updatedCourse.enrollmentCode ?? "",
        courseName: updatedCourse.courseName ?? "",
        semester: updatedCourse.semester ?? "",
        courseDescription: updatedCourse.courseDescription ?? "",
      });
      setIsEditing(false);

      console.log("Course updated successfully:", updatedCourse);
    } catch (err) {
      console.error("Failed to save course data:", err);
      setError("Failed to save course data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/materials/${fileId}?soft=true`, {
        method: "DELETE",
        headers: getAuthHeadersMultipart(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      // Remove file from state
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      console.log("File deleted successfully");
    } catch (err) {
      console.error("Failed to delete file:", err);
      setError(
        `Failed to delete file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleStartRename = (material: CourseMaterial) => {
    setEditingFileId(material.id);
    setEditingFileName(material.name);
  };

  const handleCancelRename = () => {
    setEditingFileId(null);
    setEditingFileName("");
  };

  const handleSaveRename = async (fileId: number) => {
    if (!editingFileName.trim()) {
      setError("File name cannot be empty");
      return;
    }

    try {
      // Send name as query parameter and use FormData for multipart
      const formData = new FormData();
      // Add a dummy field to ensure valid multipart request
      formData.append("_rename", "true");
      const encodedName = encodeURIComponent(editingFileName.trim());

      const response = await fetch(
        `${API_BASE}/api/materials/${fileId}?name=${encodedName}`,
        {
          method: "PATCH",
          headers: getAuthHeadersMultipart(),
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to rename file: ${response.statusText} - ${errorText}`);
      }

      const updatedMaterial: CourseMaterial = await response.json();
      
      // Update the file in state
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === fileId ? updatedMaterial : file))
      );
      
      setEditingFileId(null);
      setEditingFileName("");
      console.log("File renamed successfully");
    } catch (err) {
      console.error("Failed to rename file:", err);
      setError(
        `Failed to rename file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleReplaceFile = async (
    fileId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFile = event.target.files?.[0];
    if (!newFile) {
      return;
    }

    if (!confirm(`Are you sure you want to replace this file with "${newFile.name}"?`)) {
      event.target.value = "";
      return;
    }

    try {
      setReplacingFileId(fileId);
      setError(null);

      const formData = new FormData();
      formData.append("file", newFile);

      const response = await fetch(`${API_BASE}/api/materials/${fileId}`, {
        method: "PATCH",
        headers: getAuthHeadersMultipart(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to replace file: ${response.statusText} - ${errorText}`);
      }

      const updatedMaterial: CourseMaterial = await response.json();
      
      // Update the file in state
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === fileId ? updatedMaterial : file))
      );
      
      console.log("File replaced successfully");
      
      // Reset the file input
      event.target.value = "";
    } catch (err) {
      console.error("Failed to replace file:", err);
      setError(
        `Failed to replace file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      // Reset the file input on error too
      event.target.value = "";
    } finally {
      setReplacingFileId(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !courseData.classId) {
      return;
    }

    try {
      setUploadingFile(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      const response = await fetch(
        `${API_BASE}/api/materials?classId=${courseData.classId}`,
        {
          method: "POST",
          headers: getAuthHeadersMultipart(),
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file: ${response.statusText} - ${errorText}`);
      }

      const newMaterial: CourseMaterial = await response.json();
      setUploadedFiles((prev) => [...prev, newMaterial]);
      console.log("File uploaded successfully:", newMaterial);

      // Reset the file input
      event.target.value = "";
    } catch (err) {
      console.error("Failed to upload file:", err);
      setError(
        `Failed to upload file: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      // Reset the file input on error too
      event.target.value = "";
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseId) {
      setError("Course ID is missing");
      return;
    }

    const confirmMessage = `⚠️ WARNING: This will permanently delete the course "${courseData.courseName}" and ALL associated data including:\n\n• All course materials\n• All student enrollments\n• All chat messages\n• All embeddings\n\nThis action CANNOT be undone!\n\nType the course name to confirm deletion:`;

    const userInput = prompt(confirmMessage);
    
    if (userInput !== courseData.courseName) {
      if (userInput !== null) {
        alert("Course name does not match. Deletion cancelled.");
      }
      return;
    }

    try {
      setDeletingCourse(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/users/courses/${courseId}`, {
        method: "DELETE",
        headers: getAuthHeadersMultipart(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete course: ${response.statusText} - ${errorText}`);
      }

      console.log("Course deleted successfully");
      
      // Redirect to teacher dashboard (main courses list) after successful deletion
      window.location.href = "/teacher-dashboard";
    } catch (err) {
      console.error("Failed to delete course:", err);
      setError(
        `Failed to delete course: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setDeletingCourse(false);
    }
  };

  return (
    <>
      <TeacherTopNavbar />
      <TeacherNavbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>Course Information & Settings</h1>
            <p className={styles.pageSubtitle}>
              Manage your course details, settings, and configurations
            </p>
            {error && (
              <div
                style={{
                  color: "red",
                  padding: "10px",
                  background: "#fee",
                  margin: "10px 0",
                  borderRadius: "4px",
                }}
              >
                Error: {error}
              </div>
            )}
            {loading && (
              <div
                style={{
                  color: "blue",
                  padding: "10px",
                  background: "#e6f3ff",
                  margin: "10px 0",
                  borderRadius: "4px",
                }}
              >
                Loading course data...
              </div>
            )}
          </div>

          <div className={styles.courseNameBox}>
            <div className={styles.courseNameHeader}>
              <h2 className={styles.courseNameTitle}>Course Information</h2>
              <div className={styles.editButtonContainer}>
                {!isEditing ? (
                  <button onClick={handleEdit} className={styles.editButton}>
                    Edit Course
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button
                      onClick={handleSave}
                      className={styles.saveButton}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.courseNameContent}>
              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Course Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.courseName}
                    onChange={(e) =>
                      handleInputChange("courseName", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.courseName}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Course Code:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.enrollmentCode}
                    onChange={(e) =>
                      handleInputChange("enrollmentCode", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.enrollmentCode}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Description:</span>
                {isEditing ? (
                  <textarea
                    value={courseData.courseDescription}
                    onChange={(e) =>
                      handleInputChange("courseDescription", e.target.value)
                    }
                    className={styles.editTextarea}
                    rows={3}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.courseDescription}
                  </span>
                )}
              </div>

              <div className={styles.courseField}>
                <span className={styles.fieldLabel}>Semester:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={courseData.semester}
                    onChange={(e) =>
                      handleInputChange("semester", e.target.value)
                    }
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.fieldValue}>
                    {courseData.semester}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.uploadedFilesBox}>
            <div className={styles.courseNameHeader}>
              <h2 className={styles.sectionTitle}>Uploaded Course Files</h2>
              <div className={styles.uploadButtonContainer}>
                <label
                  htmlFor="file-upload"
                  className={styles.uploadLabel}
                  style={{ opacity: uploadingFile ? 0.6 : 1 }}
                >
                  {uploadingFile ? "Uploading..." : "Upload File"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile || !courseData.classId}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                />
              </div>
            </div>
            {materialsLoading ? (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                Loading course materials...
              </div>
            ) : uploadedFiles.length > 0 ? (
              <div className={styles.filesList}>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className={styles.fileItem}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileInfo}>
                      {editingFileId === file.id ? (
                        <div className={styles.fileNameEdit}>
                          <input
                            type="text"
                            value={editingFileName}
                            onChange={(e) => setEditingFileName(e.target.value)}
                            className={styles.editInput}
                            autoFocus
                          />
                          <div className={styles.editActions}>
                            <button
                              onClick={() => handleSaveRename(file.id)}
                              className={styles.saveButton}
                              style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className={styles.cancelButton}
                              style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.fileName}>{file.name}</div>
                          <div className={styles.fileDetails}>
                            {file.size && (
                              <>
                                <span className={styles.fileSize}>{file.size}</span>
                                <span className={styles.fileDivider}>•</span>
                              </>
                            )}
                            <span className={styles.fileDate}>
                              Uploaded:{" "}
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className={styles.fileActions}>
                      <button
                        onClick={() => handleStartRename(file)}
                        className={styles.renameButton}
                        title="Rename file"
                        disabled={editingFileId !== null}
                      >
                        ✏️
                      </button>
                      <label
                        htmlFor={`replace-file-${file.id}`}
                        className={styles.replaceButton}
                        title="Replace file"
                        style={{
                          opacity: replacingFileId === file.id ? 0.6 : 1,
                          cursor: replacingFileId === file.id ? "wait" : "pointer",
                        }}
                      >
                        🔄
                      </label>
                      <input
                        id={`replace-file-${file.id}`}
                        type="file"
                        onChange={(e) => handleReplaceFile(file.id, e)}
                        disabled={replacingFileId !== null}
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                      />
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className={styles.deleteButton}
                        title="Delete file"
                        disabled={editingFileId !== null || replacingFileId !== null}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noFiles}>
                <p>No files uploaded yet.</p>
                <p className={styles.noFilesSubtext}>
                  Upload course materials using the button above.
                </p>
              </div>
            )}
          </div>

          <div className={styles.deleteCourseSection}>
            <h3 className={styles.dangerZoneTitle}>Danger Zone</h3>
            <p className={styles.dangerZoneDescription}>
              Permanently delete this course and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={handleDeleteCourse}
              className={styles.deleteCourseButton}
              disabled={deletingCourse || loading}
            >
              {deletingCourse ? "Deleting..." : "Delete Course"}
            </button>
          </div>

          <div className={styles.backLinkContainer}>
            <Link 
              href={courseId ? `/teacher-course-dashboard?course=${courseId}` : "/teacher-course-dashboard"} 
              className={styles.backLink}
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

const CourseInfoPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center" }}>
          Loading course information...
        </div>
      }
    >
      <CourseInfoContent />
    </Suspense>
  );
};

export default CourseInfoPage;
