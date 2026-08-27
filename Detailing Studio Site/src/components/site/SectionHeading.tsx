import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "text-center" : ""}>
      {eyebrow && (
        <div className="text-xs uppercase tracking-[0.3em] text-accent">
          — {eyebrow}
        </div>
      )}
      <h2 className="mt-4 text-4xl md:text-6xl font-bold leading-[0.95]">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-base md:text-lg text-muted-foreground max-w-2xl ${center ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}