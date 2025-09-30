"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Button from "./components/Button";

export default function Home() {
  return (
    <>
      <Navbar />
      <main
        style={{
          background: "white",
          color: "black",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <h1>Home page</h1>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>

        <div style={{ marginTop: "32px" }}>
          <Button
            label="Button text"
            onClick={() => console.log("button works")}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
