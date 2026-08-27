import Link from "next/link";

const columns = [
  {
    title: "Nestly",
    links: [
      { label: "About", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Trust & safety", href: "/trust-and-safety" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "Become a host", href: "/become-a-host" },
      { label: "AI pricing assistant", href: "/become-a-host#ai-pricing" },
      { label: "Host resources", href: "/host/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Cancellation options", href: "/help/cancellation" },
      { label: "Contact us", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text font-heading text-lg font-bold text-transparent">
              Nestly
            </span>
            <p className="mt-3 max-w-xs text-sm text-text-muted">
              Book stays, not stress. An AI-enhanced stay marketplace built by
              Swayam Parikh.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-semibold text-text-heading">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-heading"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Nestly. All rights reserved.</p>
          <p>Idea &amp; concept by Swayam Parikh.</p>
        </div>
      </div>
    </footer>
  );
}
