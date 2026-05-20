import type { Metadata } from "next";
import { Syne, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RegScope — Cross-Border Compliance Intelligence",
  description:
    "Automated regulatory mapping and analysis across India, Singapore, and EU jurisdictions",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${ibmPlex.variable} ${jetbrains.variable}`}
    >
      <body
        className="antialiased min-h-screen"
        style={{
          fontFamily: "var(--font-ibm), system-ui, sans-serif",
          backgroundColor: "var(--bg-base)",
          color: "var(--text-primary)",
        }}
      >
        <Sidebar />
        <div className="md:ml-60 min-h-screen flex flex-col">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
