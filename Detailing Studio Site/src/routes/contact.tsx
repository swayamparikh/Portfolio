import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lustre Auto Studio" },
      { name: "description", content: "Visit, call or WhatsApp Lustre Auto Studio in Andheri West, Mumbai. Open 7 days a week." },
      { property: "og:title", content: "Contact — Lustre Auto Studio" },
      { property: "og:description", content: "Find us in Mumbai or chat on WhatsApp." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageShell>
      <section className="pt-40 pb-12 mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="text-xs uppercase tracking-[0.3em] text-accent">— Get in touch</div>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold leading-[0.95]">
            Talk to <span className="text-shine">the studio.</span>
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-5">
            {[
              { icon: MapPin, t: "Studio", d: "B-12, Andheri West Industrial Estate, Mumbai 400053" },
              { icon: Phone, t: "Call", d: "+91 98765 43210" },
              { icon: Mail, t: "Email", d: "hello@lustre.auto" },
              { icon: Clock, t: "Hours", d: "Mon — Sun · 9:00 AM – 8:00 PM" },
            ].map((c) => (
              <div key={c.t} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background shrink-0">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</div>
                  <div className="mt-1 font-semibold">{c.d}</div>
                </div>
              </div>
            ))}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-sm font-semibold text-white hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-4 w-4 fill-white" /> Chat on WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="aspect-square w-full overflow-hidden rounded-3xl border border-border">
            <iframe
              title="Lustre Auto Studio map"
              src="https://www.google.com/maps?q=Andheri%20West%20Mumbai&output=embed"
              className="h-full w-full grayscale contrast-125"
              loading="lazy"
            />
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}