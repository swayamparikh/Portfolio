import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}