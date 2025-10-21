"use client";

import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Link from "next/link";
import styles from "./create-course.module.css";

interface UploadedFile {
  id: string;
  name: string;
}

const CreateCoursePage: React.FC = () => {
  const [courseName, setCourseName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [termSemester, setTermSemester] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "CS101_Syllabus.txt" },
    { id: "2", name: "Course_Outline.txt" },
    { id: "3", name: "Assignment_Guidelines.txt" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
      });
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmitDocument = () => {
    console.log("Submit document clicked");
    // Handle document submission logic here
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Navbar />

      <div className={styles.pageContainer}>
        <main className={styles.mainContent}>
          {/* Two Column Layout */}
          <div className={styles.contentGrid}>
            {/* Left Column - Form */}
            <div className={styles.leftColumn}>
              {/* Course Information Section */}
              <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  Enter course information
                </h2>

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
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="classCode" className={styles.label}>
                    Class Code
                  </label>
                  <input
                    type="text"
                    id="classCode"
                    className={styles.input}
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="Enter class code"
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
                  />
                </div>

                {/* File Upload */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Upload Documents</label>
                  <div
                    className={styles.uploadArea}
                    onClick={handleUploadClick}
                  >
                    <div className={styles.uploadIcon}>☁️↑</div>
                    <span className={styles.uploadText}>
                      Click to upload files
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    multiple
                    onChange={handleFileUpload}
                    className={styles.hiddenInput}
                  />
                  <p className={styles.fileRestriction}>
                    Only .txt files are allowed
                  </p>
                </div>

                <div className={styles.buttonContainer}>
                  <Button
                    label="Submit Document"
                    onClick={handleSubmitDocument}
                  />
                </div>
              </section>

              {/* Uploaded Documents Section */}
              <section className={styles.documentsSection}>
                <h2 className={styles.sectionTitle}>Uploaded Documents</h2>
                <div className={styles.filesList}>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeFile(file.id)}
                        aria-label={`Remove ${file.name}`}
                      >
                        ✕
                      </button>
                      <span className={styles.fileName}>{file.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Information */}
            <div className={styles.rightColumn}>
              <h1 className={styles.mainTitle}>Create a New Course</h1>

              <div className={styles.infoContent}>
                <p className={styles.infoParagraph}>
                  Set up a new course and build a custom AI Teaching Assistant
                  that supports your students using your course materials.
                </p>

                <p className={styles.infoParagraph}>
                  Your AI Assistant will use these documents to provide
                  context-aware support. You can add more later if needed.
                  (Supported formats: PDF, DOCX, PPTX, TXT)
                </p>

                <p className={styles.infoParagraph}>
                  Once your course is created, the AI Assistant will begin
                  training using the materials you&apos;ve uploaded. You&apos;ll
                  be able to:
                </p>

                <ul className={styles.featuresList}>
                  <li>Preview how it answers student questions</li>
                  <li>Add or remove documents at any time</li>
                  <li>Monitor student activity and questions</li>
                </ul>

                <p className={styles.ctaParagraph}>
                  Ready to Launch? When you&apos;re ready, click{" "}
                  <strong className={styles.createLink}>Create Course</strong>{" "}
                  and your dashboard will be updated with this new class.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className={styles.backLinkContainer}>
            <Link href="/" className={styles.backLink}>
              Back to Main Page
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default CreateCoursePage;
