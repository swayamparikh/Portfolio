import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/ui/SidebarNav";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DocMind — Answers you can trace.",
  description: "Self-updating RAG pipeline with live evaluation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <SidebarNav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
