"use client";

import React, { useState } from "react";
import styles from "./FAQ.module.css";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <button
        className={styles.questionButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.questionText}>{question}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className={styles.answer}>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const faqData = [
    {
      question: "How does AskKnightro help students with their studies?",
      answer:
        "AskKnightro provides 24/7 academic support through AI-powered assistance, helping students understand complex concepts, complete assignments, and improve their learning outcomes with personalized guidance.",
    },
    {
      question: "What subjects and topics does AskKnightro cover?",
      answer:
        "AskKnightro covers a wide range of subjects including mathematics, science, literature, history, and more. Our AI assistant can help with homework, research projects, and study preparation across multiple academic disciplines.",
    },
    {
      question: "Is AskKnightro available for teachers as well as students?",
      answer:
        "Yes! AskKnightro offers specialized tools for educators, including classroom management features, student progress tracking, lesson planning assistance, and data analytics to help improve teaching effectiveness.",
    },
    {
      question: "How secure is my data and academic information?",
      answer:
        "We take privacy and security very seriously. All student and teacher data is encrypted, securely stored, and never shared with third parties. We comply with educational privacy standards including FERPA and COPPA.",
    },
    {
      question: "Can I access AskKnightro on mobile devices?",
      answer:
        "Absolutely! AskKnightro is fully responsive and works seamlessly on smartphones, tablets, laptops, and desktop computers. You can access help whenever and wherever you need it.",
    },
    {
      question:
        "What makes AskKnightro different from other educational platforms?",
      answer:
        "AskKnightro combines AI-powered personalized learning with real-time support, comprehensive analytics for educators, and an intuitive interface designed specifically for academic success at all levels.",
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Find answers to common questions about AskKnightro
          </p>
        </div>
        <div className={styles.faqList}>
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
