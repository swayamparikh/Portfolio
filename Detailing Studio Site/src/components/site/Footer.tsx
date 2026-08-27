import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl font-bold">LUSTRE<span className="text-accent">.</span></h3>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            India's premium car detailing studio. Precision ceramic coatings, PPF, and luxury interior care for the country's finest automobiles.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Mail].map((Icon, i) => (
              <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/services", label: "Services" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About" },
              { to: "/booking", label: "Book" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-foreground/80 hover:text-accent transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Studio</h4>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" /> Andheri West, Mumbai 400053</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-accent shrink-0" /> +91 98765 43210</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-accent shrink-0" /> hello@lustre.auto</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lustre Auto Studio. Crafted in India.
      </div>
    </footer>
  );
}