import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Ensure the import path is correct

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ background: "white", color: "black", minHeight: "100vh" }}>
        <h1>Home page</h1>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
        <p>This is the home page</p>
      </main>
      <Footer />
    </>
  );
}
