import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AskKnightro",
  description: "AI Course Assistant built with Next.js and Spring Boot",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      {/* Combine all font variables so all are available */}
      <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable}`}
          style={{ fontFamily: "var(--font-poppins)" }}
      >
      {children}
      </body>
      </html>
  );
}