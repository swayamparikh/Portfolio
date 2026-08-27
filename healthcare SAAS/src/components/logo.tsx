import Link from "next/link";

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_20px_-4px] shadow-cyan-400/60">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path
            d="M3 13h3.5l2-6 3 12 2.5-8 1.5 2H21"
            stroke="#04060d"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={`font-bold tracking-tight ${small ? "text-sm" : "text-base"}`}>
        PhysioFlow<span className="text-cyan-400"> AI</span>
      </span>
    </Link>
  );
}
