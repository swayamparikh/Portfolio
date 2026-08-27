import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhysioFlow AI — stop charting at 9pm",
  description:
    "AI that turns each physiotherapy session into a structured SOAP note, tracks exercise progress across visits, and drafts the insurance progress reports that keep sessions authorized.",
  openGraph: {
    title: "PhysioFlow AI",
    description: "Your session notes, drafted before you've finished the handover.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="aurora" aria-hidden />
        <div className="grid-floor" aria-hidden />
        {children}
      </body>
    </html>
  );
}
