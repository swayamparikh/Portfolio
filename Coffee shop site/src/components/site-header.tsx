import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";

const nav = [
  { to: "/menu", label: "Menu" },
  { to: "/franchise", label: "Franchise" },
  { to: "/about", label: "Our Story" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Locations" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors ${scrolled ? "bg-cream/90 border-mocha/10" : "bg-cream/60 border-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-mocha">
          Ethos Roast
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-mocha hover:text-honey transition-colors"
              activeProps={{ className: "text-honey" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <Link
          to="/franchise"
          className="hidden md:inline-flex items-center gap-2 bg-mocha text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-roast transition-colors"
        >
          <span>Franchise Inquiry</span>
          <span className="size-1.5 rounded-full bg-honey" />
        </Link>
        <button onClick={() => setOpen(!open)} className="md:hidden text-mocha" aria-label="Menu">
          <div className="w-6 h-0.5 bg-mocha mb-1.5" />
          <div className="w-6 h-0.5 bg-mocha mb-1.5" />
          <div className="w-4 h-0.5 bg-mocha" />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-mocha/10 bg-cream px-6 py-6 space-y-4">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block text-mocha font-medium">
              {n.label}
            </Link>
          ))}
          <Link to="/franchise" onClick={() => setOpen(false)} className="block bg-mocha text-cream px-5 py-3 rounded-full text-center text-sm">
            Franchise Inquiry
          </Link>
        </div>
      )}
    </nav>
  );
}
