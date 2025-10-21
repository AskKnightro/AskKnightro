"use client";

import React from "react";
import CourseCard from "../components/CourseCard";

export default function Page() {
    //load up a component here to test
    return (<div>
      <h1>Component Test Page</h1>
      <p>This page is used for testing components during development.</p>
        <CourseCard
            id="intro-to-react"
            courseTitle="Introduction to React"
            numQuestions={45}
            numStudents={10}
        />
    </div>);
}