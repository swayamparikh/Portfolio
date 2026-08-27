import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nestly.example.com"),
  title: {
    default: "Nestly — Book stays, not stress.",
    template: "%s | Nestly",
  },
  description:
    "Nestly is an AI-enhanced stay booking marketplace. Search, book, and manage stays with real-time availability, verified hosts, and smart AI trip planning.",
  openGraph: {
    title: "Nestly — Book stays, not stress.",
    description:
      "Search, book, and manage stays with real-time availability, verified hosts, and AI-powered trip planning.",
    siteName: "Nestly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nestly — Book stays, not stress.",
    description:
      "Search, book, and manage stays with real-time availability, verified hosts, and AI-powered trip planning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-body">
        {children}
      </body>
    </html>
  );
}
