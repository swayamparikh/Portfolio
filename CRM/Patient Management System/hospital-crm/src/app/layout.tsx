import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MediCRM — Hospital Management System",
    template: "%s | MediCRM",
  },
  description:
    "AI-powered hospital and clinic management platform. Manage patients, appointments, EMR, billing, and staff from a single dashboard.",
  keywords: ["hospital management", "clinic CRM", "patient management", "EMR", "healthcare software"],
  authors: [{ name: "MediCRM" }],
  creator: "MediCRM",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
