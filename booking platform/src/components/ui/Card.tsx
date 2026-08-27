import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08)]",
        hover &&
          "transition-all duration-300 ease-out hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
}
