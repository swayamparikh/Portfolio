import { ShieldCheck, Zap, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeTone = "trust" | "ocean" | "coral" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  trust: "bg-trust/10 text-trust",
  ocean: "bg-ocean/10 text-ocean",
  coral: "bg-coral-to/10 text-coral-to",
  neutral: "bg-surface text-text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedHostBadge() {
  return (
    <Badge tone="ocean">
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified Host
    </Badge>
  );
}

export function InstantBookBadge() {
  return (
    <Badge tone="trust">
      <Zap className="h-3.5 w-3.5" />
      Instant Book
    </Badge>
  );
}

export function VerifiedBookingBadge() {
  return (
    <Badge tone="ocean" className="bg-ocean/5">
      <BadgeCheck className="h-3.5 w-3.5" />
      Verified stay
    </Badge>
  );
}
