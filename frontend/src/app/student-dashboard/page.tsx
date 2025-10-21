import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main
        style={{
          background: "white",
          color: "black",
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <h1>Student Dashboard</h1>
      </main>
      <Footer />
    </>
  );
}
