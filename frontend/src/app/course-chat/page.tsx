// src/app/course-chat/page.tsx
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Navbar from "../components/Navbar";
import styles from "./course-chat.module.css";

type Message = {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
};

type CourseDto = {
  classId: number;
  enrollmentCode: string;
  courseName: string;
  semester: string | null;
  teacherId: number | null;
  courseDescription: string | null;
  shardId: string | null;
};

type TeacherDto = {
  teacherId: number;
  name: string;
  email: string;
  department?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
};

export const dynamic = "force-dynamic";

// --- Shell: keep Suspense because we use useSearchParams inside ---
export default function PageShell() {
  return (
      <>
        <Navbar />
        <Suspense fallback={<div className={styles.pageContainer}><div className={styles.courseHeader}><h1>Loading…</h1></div></div>}>
          <CourseChatContent />
        </Suspense>
      </>
  );
}

function CourseChatContent() {
  const params = useSearchParams();
  const courseId = useMemo(() => {
    const q = params?.get("course");
    return q ? parseInt(q, 10) : undefined;
  }, [params]);

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [teacher, setTeacher] = useState<TeacherDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");

  // chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch course -> teacher
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!courseId) {
        setLoading(false);
        setErr("No course selected.");
        return;
      }
      try {
        setLoading(true);
        setErr("");

        // 1) Course
        const cRes = await fetch(`http://localhost:8080/api/users/courses/${courseId}`, {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!cRes.ok) {
          const text = await cRes.text();
          throw new Error(`Failed to load course (${cRes.status}): ${text || cRes.statusText}`);
        }
        const cDto: CourseDto = await cRes.json();
        if (cancelled) return;
        setCourse(cDto);

        // 2) Teacher (optional)
        if (cDto.teacherId != null) {
          const tRes = await fetch(`http://localhost:8080/api/users/teachers/${cDto.teacherId}`, {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });
          if (tRes.ok) {
            const tDto: TeacherDto = await tRes.json();
            if (!cancelled) setTeacher(tDto);
          }
        }

        // 3) Seed welcome message if chat empty
        if (!cancelled && messages.length === 0) {
          setMessages([{
            id: Date.now(),
            type: "ai",
            content: `Hello! I'm Knightro, your AI assistant for ${cDto.courseName}. Ask me anything about the course, assignments, or study tips.`,
            timestamp: new Date(),
          }]);
        }
      } catch (e: unknown) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Unable to load course.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // UI helpers
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  };
  useEffect(() => { adjustTextareaHeight(); }, [inputMessage]);

  // Fake LLM response (keep your stub)
  const generateAIResponse = (): string => {
    const responses = [
      "Good question! Here's how this connects to your course material…",
      "Let me break that down and relate it to what you’ve covered in class…",
      "Here’s a concise explanation with examples from your syllabus…",
      "Think of it this way based on what’s in your lectures and readings…",
      "I’ll outline the key points and how to study them efficiently…",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Replace with real API that uses courseId to ground answers
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: generateAIResponse(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  const courseName = course?.courseName ?? (loading ? "Loading…" : "—");
  const instructorName = teacher?.name ?? (course?.teacherId ? "Instructor" : "TBA");

  return (
      <div className={styles.pageContainer}>
        {/* Header shows dynamic course + instructor */}
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <h1 className={styles.courseName}>{courseName}</h1>
            <p className={styles.courseDetails}>
              {course?.semester ?? "—"} • Instructor: {instructorName}
            </p>
            {err && <p style={{ color: "crimson", fontWeight: 600 }}>{err}</p>}
          </div>
          <div className={styles.aiIndicator}>
            <div className={styles.aiIcon}>
              <Image src="/knightro2.png" alt="Knightro AI" width={20} height={20} />
            </div>
            <span className={styles.aiLabel}>Knightro AI</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatContainer}>
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`${styles.messageWrapper} ${
                        message.type === "user" ? styles.userMessage : styles.aiMessage
                    }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageAvatar}>
                      {message.type === "user" ? (
                          "👤"
                      ) : (
                          <Image src="/knightro2.png" alt="Knightro AI" width={28} height={28} />
                      )}
                    </div>
                    <div className={styles.messageBody}>
                      <div className={styles.messageText}>{message.content}</div>
                      <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                </div>
            ))}

            {isTyping && (
                <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.messageAvatar}>
                      <Image src="/knightro2.png" alt="Knightro AI" width={28} height={28} />
                    </div>
                    <div className={styles.messageBody}>
                      <div className={styles.typingIndicator}>
                        <div className={styles.typingDots}><span></span><span></span><span></span></div>
                        <span className={styles.typingText}>Knightro is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
              <div className={styles.inputWrapper}>
              <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the course..."
                  className={styles.messageInput}
                  disabled={isTyping || !!err || !courseId}
                  rows={1}
              />
                <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping || !!err || !courseId}
                    className={styles.sendButton}
                    title={!courseId ? "Open from a course card so I know which class!" : "Send"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
            <p className={styles.inputHint}>Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
  );
}