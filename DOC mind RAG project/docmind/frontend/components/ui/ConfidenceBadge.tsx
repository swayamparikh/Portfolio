import clsx from "clsx";

const STYLES: Record<"high" | "medium" | "low", { label: string; className: string }> = {
  high: { label: "HIGH CONFIDENCE", className: "border-graphite text-graphite" },
  medium: { label: "MEDIUM", className: "border-warning text-warning" },
  low: { label: "LOW / VERIFY", className: "border-signal text-signal" },
};

export function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const style = STYLES[confidence];
  return (
    <span
      className={clsx(
        "rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide",
        style.className
      )}
    >
      {style.label}
    </span>
  );
}
