import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/booking", label: "Booking" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative grid h-9 w-9 place-items-center rounded-full border border-accent/40 bg-accent/10">
            <Sparkles className="h-4 w-4 text-accent transition-transform group-hover:rotate-12" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            LUSTRE<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
              <span className="absolute bottom-1 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          ))}
        </nav>

        <Link
          to="/booking"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105"
        >
          Book Now
        </Link>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-panel mx-6 mt-3 rounded-2xl p-4 animate-fade-in">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="block mt-2 rounded-full bg-foreground px-5 py-3 text-center text-sm font-semibold text-background"
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}