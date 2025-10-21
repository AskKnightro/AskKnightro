"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import styles from "./course-chat.module.css";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface Course {
  id: number;
  name: string;
  subject: string;
  instructor: string;
}

export default function CourseChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm Knightro, your AI course assistant for Introduction to Psychology. I'm here to help you with course content, assignments, study tips, and answer any questions you have about the material. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentCourse] = useState<Course>({
    id: 1,
    name: "Introduction to Psychology",
    subject: "Psychology",
    instructor: "Dr. Sarah Johnson",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: generateAIResponse(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (): string => {
    // Simulate AI responses based on input - replace with actual AI API
    const responses = [
      "That's a great question about psychology! Let me help you understand this concept better. In psychology, we often look at behavior from multiple perspectives...",
      "I can help you with that topic. Here's what you need to know for your psychology course...",
      "Let me break this down for you. This concept relates to what we've covered in class about human behavior and mental processes...",
      "That's an important part of your psychology curriculum. Here's a detailed explanation that should help with your studies...",
      "I understand you're asking about this psychological concept. Let me provide you with a comprehensive answer that connects to your course material...",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as React.FormEvent);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <Navbar />
      <div className={styles.pageContainer}>
        {/* Course Header */}
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <h1 className={styles.courseName}>{currentCourse.name}</h1>
            <p className={styles.courseDetails}>
              {currentCourse.subject} • Instructor: {currentCourse.instructor}
            </p>
          </div>
          <div className={styles.aiIndicator}>
            <div className={styles.aiIcon}>
              <Image
                src="/knightro2.png"
                alt="Knightro AI"
                width={20}
                height={20}
              />
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
                  message.type === "user"
                    ? styles.userMessage
                    : styles.aiMessage
                }`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageAvatar}>
                    {message.type === "user" ? (
                      "👤"
                    ) : (
                      <Image
                        src="/knightro2.png"
                        alt="Knightro AI"
                        width={28}
                        height={28}
                      />
                    )}
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.messageText}>{message.content}</div>
                    <div className={styles.messageTime}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.messageAvatar}>
                    <Image
                      src="/knightro2.png"
                      alt="Knightro AI"
                      width={28}
                      height={28}
                    />
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.typingIndicator}>
                      <div className={styles.typingDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className={styles.typingText}>
                        Knightro is typing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
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
                  disabled={isTyping}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className={styles.sendButton}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
            <p className={styles.inputHint}>
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
